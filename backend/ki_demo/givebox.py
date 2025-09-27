# givebox.py
from enum import Enum
from openai import OpenAI
from PIL import Image, ImageOps
from pydantic import BaseModel, conlist
from typing import List, Optional
import io, base64, json, os, argparse, requests, sys
from datetime import datetime

# -------- Kategorien (Objekte in der Givebox) --------
class Category(str, Enum):
    books = "books"
    clothes = "clothes"
    toys = "toys"
    electronics = "electronics"
    kitchen_items = "kitchen_items"
    household_goods = "household_goods"
    shoes = "shoes"
    bags = "bags"
    games = "games"
    decorations = "decorations"
    tools = "tools"
    office_supplies = "office_supplies"
    plants = "plants"
    food = "food"
    other = "other"

# -------- Gate-Status --------
class GateStatus(str, Enum):
    givebox_ok = "givebox_ok"
    givebox_not_ok = "givebox_not_ok"

# -------- Füllstand --------
class Fullness(str, Enum):
    leer = "leer"
    normal_gefuellt = "normal gefüllt"
    voll = "voll"
    ueberfuellt = "überfüllt"

# -------- Pydantic-Modelle --------
# Items (mit/ohne BBox)
class ItemWithBBox(BaseModel):
    name: str
    category: Category
    bbox: conlist(int, min_length=4, max_length=4) # type: ignore

class ItemNoBBox(BaseModel):
    name: str
    category: Category

# Kombimodelle: Items + Füllstand
class VisionWithBBox(BaseModel):
    items: List[ItemWithBBox]
    fullness: Fullness

class VisionNoBBox(BaseModel):
    items: List[ItemNoBBox]
    fullness: Fullness

# Gate-Modelle
class GateItem(BaseModel):
    category: GateStatus

class GateList(BaseModel):
    items: List[GateItem]

# -------- Bildaufbereitung --------
def _encode_as_data_uri(img: Image.Image, quality: int = 85) -> str:
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=quality, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"

def prepare_image_from_bytes(
    raw: bytes,
    max_width: int = 1600,
    quality: int = 85
) -> str:
    img = Image.open(io.BytesIO(raw))
    img = ImageOps.exif_transpose(img)
    w, h = img.size
    if w > max_width:
        img = img.resize((max_width, int(h * max_width / w)), Image.LANCZOS)
    return _encode_as_data_uri(img, quality=quality)

def fetch_url_bytes(url: str, max_bytes: int = 10_000_000) -> bytes:
    # 10 MB Limit als einfache Schutzmaßnahme
    r = requests.get(url, timeout=20, stream=True)
    r.raise_for_status()
    content = io.BytesIO()
    size = 0
    for chunk in r.iter_content(1024 * 64):
        size += len(chunk)
        if size > max_bytes:
            raise ValueError("Bild ist größer als das erlaubte Limit (10 MB).")
        content.write(chunk)
    return content.getvalue()

# -------- Prompts --------
BASE_SYSTEM_INSTRUCTIONS = (
    "Du bist ein sehr strenger Bilderkenner für Gegenstände in einer Givebox."
    " Kategorisiere ausschließlich wirklich erkennbare Objekte im Bild in eine der festen Kategorien:"
    " books, clothes, toys, electronics, kitchen_items, household_goods, shoes, bags, games, decorations,"
    " tools, office_supplies, plants, food, other."
    " Keine Halluzinationen, keine Vermutungen."
    " Wenn etwas unklar ist, lasse es weg (gilt für Objekte)."
    " Gib pro Objekt einen prägnanten 'name' (z. B. 'Roman: Der Prozess', 'Herren-T-Shirt blau', 'Wasserkocher')."
    " Für Bücher gilt eine strikte Regel:"
    " - Wenn Titel (und optional Autor) erkennbar sind → verwende diese als 'name' (z. B. 'Der Prozess – Franz Kafka')."
    " - Wenn kein Titel erkennbar ist → verwende eine neutrale Bezeichnung wie 'Buch' oder 'mehrere Bücher'."
    " Duplikate vermeiden (gleiche Objekte/Namen zusammenführen)."
    " Titel/Bezeichnungen in Originalsprache belassen."
    " Zusätzlich MUSST du den Füllstand der Givebox einschätzen (fullness) und GENAU EINEN der Werte wählen:"
    " 'leer', 'normal gefüllt', 'voll', 'überfüllt'."
)

def build_system_instructions(use_bbox: bool) -> str:
    if use_bbox:
        return (
            BASE_SYSTEM_INSTRUCTIONS
            + " Für JEDES erkannte Objekt MUSS eine Bounding Box als [x, y, w, h] zurückgegeben werden."
            + " x,y sind die Koordinaten der oberen linken Ecke in Pixeln relativ zum Bild."
        )
    return BASE_SYSTEM_INSTRUCTIONS + " Gib KEINE Bounding Boxes zurück."

def build_user_content(image_data_uri: str, use_bbox: bool):
    bbox_part = (
        "Jedes Item MUSS zusätzlich 'bbox' mit [x, y, w, h] enthalten."
        if use_bbox else
        "Gib KEIN 'bbox'-Feld aus."
    )
    return [
        {
            "type": "input_text",
            "text": (
                "Erkenne und liste alle Gegenstände in der Givebox."
                " Ordne jedes Objekt GENAU EINER der vorgegebenen Kategorien zu."
                " Nur reale, im Bild erkennbare Dinge (keine Schilder, Deko-Texte o. Ä.,"
                " es sei denn sie sind selbst Objekte). "
                "Ausgabe als JSON-Objekt mit genau zwei Feldern:"
                " 'items' (Liste von Objekten mit: name, category"
                + (", bbox" if use_bbox else "")
                + ") und 'fullness' (genau einer der Werte: 'leer', 'normal gefüllt', 'voll', 'überfüllt'). "
                "Für Objekte gilt: wenn unklar, weglassen. Für 'fullness' MUSST du trotzdem einen einzelnen Wert wählen."
                " Kategorien (für items): books, clothes, toys, electronics, kitchen_items, household_goods, shoes, bags,"
                " games, decorations, tools, office_supplies, plants, food, other. "
                "Deutsch ausgeben. "
                + bbox_part
            ),
        },
        {"type": "input_image", "image_url": image_data_uri},
    ]

# --- Gate-Prompts (Givebox-Erkennung Ja/Nein) ---
GIVEBOX_CHECK_INSTRUCTIONS = (
    "Du bist ein sehr strenger Bilderkenner für Giveboxen."
    " Kategorisiere ausschließlich in eine der festen Kategorien:"
    " givebox_ok, givebox_not_ok."
    " Keine Halluzinationen, keine Vermutungen."
    " Wenn etwas unklar ist, lasse es weg."
)

def build_user_content_givebox_check(image_data_uri: str):
    return [
        {
            "type": "input_text",
            "text": (
                "Erkenne, ob auf dem Bild eine Givebox zu sehen ist."
                " Gib genau eine Kategorie zurück: givebox_ok oder givebox_not_ok."
                " Deutsch ausgeben."
            ),
        },
        {"type": "input_image", "image_url": image_data_uri},
    ]

# -------- Kernfunktionen --------
def analyze_image(
    image_bytes: bytes,
    use_bbox: bool = True,
    model: str = "gpt-5-mini",
    timeout: Optional[int] = None,
) -> dict:
    """
    Nimmt rohe Bildbytes entgegen, führt die Objekterkennung + Füllstandseinordnung aus und gibt ein JSON-serialisierbares Dict zurück.
    (Ohne Gate)
    """
    image_data_uri = prepare_image_from_bytes(image_bytes)
    AnalysisModel = VisionWithBBox if use_bbox else VisionNoBBox

    client = OpenAI(timeout=timeout)
    resp = client.responses.parse(
        model=model,
        input=[
            {"role": "system", "content": build_system_instructions(use_bbox)},
            {"role": "user", "content": build_user_content(image_data_uri, use_bbox)},
        ],
        text_format=AnalysisModel,
    )

    parsed = resp.output_parsed
    items = parsed.items
    fullness = parsed.fullness

    # Deduplikation (case-insensitive Name)
    seen = set()
    clean = []
    for i in items:
        key = i.name.strip().lower()
        if key in seen:
            continue
        seen.add(key)
        clean.append(i)

    result_items = []
    for i in clean:
        base = {"name": i.name, "category": i.category.value}
        if use_bbox:
            base["bbox"] = i.bbox
        result_items.append(base)

    return {
        "generated_at": datetime.now().isoformat(),
        "categories": [c.value for c in Category],
        "fullness": fullness.value,
        "items": result_items,
    }

def analyze_image_with_gate(
    image_bytes: bytes,
    use_bbox: bool = True,
    gate_model: str = "gpt-5-mini",
    model: str = "gpt-5-mini",
    timeout: Optional[int] = None,
) -> dict:
    """
    Führt zuerst das Givebox-Gate aus. Nur bei givebox_ok erfolgt die Objekterkennung + Füllstand.
    """
    image_data_uri = prepare_image_from_bytes(image_bytes)
    client = OpenAI(timeout=timeout)

    # 1) Gate-Check
    gate_resp = client.responses.parse(
        model=gate_model,
        input=[
            {"role": "system", "content": GIVEBOX_CHECK_INSTRUCTIONS},
            {"role": "user", "content": build_user_content_givebox_check(image_data_uri)},
        ],
        text_format=GateList,
    )

    gate_items = gate_resp.output_parsed.items
    gate_ok = any(gi.category == GateStatus.givebox_ok for gi in gate_items)

    if not gate_ok:
        # Frühzeitige Rückgabe – keine Items, fullness = null
        return {
            "generated_at": datetime.now().isoformat(),
            "gate_status": GateStatus.givebox_not_ok.value,
            "categories": [c.value for c in Category],
            "fullness": None,
            "items": [],
        }

    # 2) Objekterkennung + Füllstand (nur wenn Gate OK)
    AnalysisModel = VisionWithBBox if use_bbox else VisionNoBBox
    resp = client.responses.parse(
        model=model,
        input=[
            {"role": "system", "content": build_system_instructions(use_bbox)},
            {"role": "user", "content": build_user_content(image_data_uri, use_bbox)},
        ],
        text_format=AnalysisModel,
    )

    parsed = resp.output_parsed
    items = parsed.items
    fullness = parsed.fullness

    # Deduplikation
    seen = set()
    clean = []
    for i in items:
        key = i.name.strip().lower()
        if key in seen:
            continue
        seen.add(key)
        clean.append(i)

    result_items = []
    for i in clean:
        base = {"name": i.name, "category": i.category.value}
        if use_bbox:
            base["bbox"] = i.bbox
        result_items.append(base)

    return {
        "generated_at": datetime.now().isoformat(),
        "gate_status": GateStatus.givebox_ok.value,
        "categories": [c.value for c in Category],
        "fullness": fullness.value,
        "items": result_items,
    }

# -------- CLI --------
def _cli():
    parser = argparse.ArgumentParser(description="Givebox-Bilderkenner (CLI)")
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument("--path", help="Pfad zu einem Bild")
    g.add_argument("--url", help="URL zu einem Bild")
    parser.add_argument("--no-bbox", action="store_true", help="Ohne Bounding Boxes ausgeben")
    parser.add_argument("--no-gate", action="store_true", help="Gate-Prüfung (Givebox ja/nein) deaktivieren")
    parser.add_argument("--model", default="gpt-5-mini", help="OpenAI Modellname für die Objekterkennung")
    parser.add_argument("--gate-model", default="gpt-5-mini", help="OpenAI Modellname für das Gate")
    parser.add_argument("--timeout", type=int, default=None, help="Client-Timeout in Sekunden")
    parser.add_argument("--out", help="Optional: Pfad für JSON-Output (sonst stdout)")
    args = parser.parse_args()

    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("Bitte OPENAI_API_KEY als Umgebungsvariable setzen.")

    # Exit-Codes:
    # 0 = Erfolg
    # 2 = Keine Givebox erkannt (Gate negativ)
    # 3 = Download-/Dateifehler (Input)
    # 4 = OpenAI/API-Fehler
    # 1 = Sonstiger unerwarteter Fehler / Abbruch
    try:
        # Bild laden
        if args.path:
            try:
                with open(args.path, "rb") as f:
                    img_bytes = f.read()
            except Exception as e:
                print(f"Fehler beim Lesen der Datei: {e}", file=sys.stderr)
                sys.exit(3)
        else:
            try:
                img_bytes = fetch_url_bytes(args.url)
            except Exception as e:
                print(f"Fehler beim Laden der URL: {e}", file=sys.stderr)
                sys.exit(3)

        # Analyse
        if args.no_gate:
            data = analyze_image(
                image_bytes=img_bytes,
                use_bbox=not args.no_bbox,
                model=args.model,
                timeout=args.timeout,
            )
        else:
            data = analyze_image_with_gate(
                image_bytes=img_bytes,
                use_bbox=not args.no_bbox,
                gate_model=args.gate_model,
                model=args.model,
                timeout=args.timeout,
            )

        # Wenn Gate aktiv war und keine Givebox erkannt wurde -> Exit 2
        if not args.no_gate and data.get("gate_status") == GateStatus.givebox_not_ok.value:
            js = json.dumps(data, ensure_ascii=False, indent=2)
            if args.out:
                with open(args.out, "w", encoding="utf-8") as f:
                    f.write(js)
            else:
                print(js)
            sys.exit(2)

        # Normaler Erfolg
        js = json.dumps(data, ensure_ascii=False, indent=2)
        if args.out:
            with open(args.out, "w", encoding="utf-8") as f:
                f.write(js)
        else:
            print(js)
        sys.exit(0)

    except SystemExit:
        # bewusst gesetzte Exit-Codes weiterreichen
        raise
    except KeyboardInterrupt:
        print("Abgebrochen.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        # OpenAI / sonstige Fehler
        print(f"Fehler: {e}", file=sys.stderr)
        sys.exit(4)

if __name__ == "__main__":
    _cli()

# -------------------------------------------
# CLI Flags (für givebox.py)
#
# Pflicht: Entweder --path oder --url
#   --path <pfad>       Pfad zu einem lokalen Bild
#   --url <url>         URL zu einem Bild
#
# Optionale Flags:
#   --no-bbox           Bounding Boxes NICHT zurückgeben (nur name + category)
#   --no-gate           Gate-Prüfung (Givebox ja/nein) überspringen
#   --model <name>      OpenAI-Modell für die Objekterkennung (Default: gpt-5-mini)
#   --gate-model <name> OpenAI-Modell für das Gate (Default: gpt-5-mini)
#   --timeout <sek>     Timeout für OpenAI-Client in Sekunden
#   --out <pfad>        Pfad für JSON-Output (Default: stdout)
#
# Exit-Codes:
#   0 = Erfolg
#   2 = Keine Givebox erkannt (Gate negativ)
#   3 = Download-/Dateifehler (Input)
#   4 = OpenAI/API-Fehler
#   1 = Sonstiger unerwarteter Fehler / Abbruch
#
# Beispiele:
#   python givebox.py --path bild.jpg
#   python givebox.py --path bild.jpg --no-bbox
#   python givebox.py --url https://.../givebox.png --out result.json
#   python givebox.py --path bild.jpg --no-gate --model gpt-5-large
# -------------------------------------------
