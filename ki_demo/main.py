from enum import Enum
from openai import OpenAI
from PIL import Image, ImageOps
import io, base64, os, json
from pydantic import BaseModel, Field, conlist
from typing import Optional, List


# ---------- Bild vorbereiten: skalieren & JPEG komprimieren ----------
def prepare_image(path: str, max_width: int = 1600, quality: int = 85) -> str:
    img = Image.open(path)
    img = ImageOps.exif_transpose(img)           # EXIF-Orientierung korrigieren
    w, h = img.size
    if w > max_width:
        img = img.resize((max_width, int(h * max_width / w)), Image.LANCZOS)
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=quality, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"

# ---------- catching givebox pictures ----------
GIVEBOX_CHECK_INSTRUCTIONS = (
    "Du bist ein sehr strenger Bilderkenner für Giveboxen."
    " Kategorisiere ausschließlich in eine der festen Kategorien:"
    " givebox-ok, no-givebox"
    " Keine Halluzinationen, keine Vermutungen."
    " Wenn etwas unklar ist, lasse es weg."
)

def build_user_content_givebox_check(image_url: str):
    return [
        {
            "type": "input_text",
            "text": (
                " Erkenne, ob auf dem Bild eine Givebox zu sehen ist."
                " Ordne jedes Objekt GENAU EINER der vorgegebenen Kategorien zu."
                " Nur reale, im Bild erkennbare Dinge (keine Schilder, Deko-Texte o. Ä.,"
                " es sei denn sie sind selbst Objekte)."
                " Ausgabe bitte als strukturierte Liste von Items mit: givebox."
                " Kategorien: givebox-ok, no-givebox"
                " Deutsch ausgeben."
            ),
        },
        {"type": "input_image", "image_url": image_url},
    ]



# ---------- Kategorien ----------
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
    givebox_ok = "givebox_ok"
    givebox_not_ok = "givebox_not_ok"


# ---------- Datenmodelle ----------
class Item(BaseModel):
    name: str
    category: Category
    bbox: Optional[conlist(int, min_length=4, max_length=4)] = None  # [x, y, w, h]


class ItemList(BaseModel):
    items: List[Item]


# ---------- Prompts ----------
SYSTEM_INSTRUCTIONS = (
    "Du bist ein sehr strenger Bilderkenner für Gegenstände in einer Givebox."
    " Kategorisiere ausschließlich wirklich erkennbare Objekte im Bild in eine der festen Kategorien:"
    " books, clothes, toys, electronics, kitchen_items, household_goods, shoes, bags, games, decorations,"
    " tools, office_supplies, plants, food, other."
    " Keine Halluzinationen, keine Vermutungen."
    " Wenn etwas unklar ist, lasse es weg."
    " Gib pro Objekt einen prägnanten 'name' (z. B. 'Roman: Der Prozess', 'Herren-T-Shirt blau', 'Wasserkocher')."
    " Für Bücher, wenn sicher lesbar, darfst du Titel (und optional Autor) als name verwenden."
    " Duplikate vermeiden (gleiche Objekte/Namen zusammenführen)."
    " Titel/Bezeichnungen in Originalsprache belassen."
)

def build_user_content(image_url: str):
    return [
        {
            "type": "input_text",
            "text": (
                " Erkenne und liste alle Gegenstände in der Givebox."
                " Ordne jedes Objekt GENAU EINER der vorgegebenen Kategorien zu."
                " Nur reale, im Bild erkennbare Dinge (keine Schilder, Deko-Texte o. Ä.,"
                " es sei denn sie sind selbst Objekte)."
                " Ausgabe bitte als strukturierte Liste von Items mit: name, category, confidence, optional bbox."
                " Kategorien: books, clothes, toys, electronics, kitchen_items, household_goods, shoes, bags,"
                " games, decorations, tools, office_supplies, plants, food, other."
                " Deutsch ausgeben."
            ),
        },
        {"type": "input_image", "image_url": image_url},
    ]


# ---------- JSON speichern ----------
def save_json(items, path="givebox.json"):
    data = {
        "generated_at": __import__("datetime").datetime.now().isoformat(),
        "categories": [c.value for c in Category],
        "items": [
            {
                "name": i.name,
                "category": i.category.value,
                **({"bbox": i.bbox} if i.bbox else {})
            }
            for i in items
        ],
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)



# ---------- Hauptfunktion ----------
def main():
    client = OpenAI()

    image_url = prepare_image("/home/ross/Dokumente/projekte/buecherregale-giveboxen-muenster/test2nah.jpeg")

    # Abfangen von keinen Givebox-Bildern
    resp = client.responses.parse(
        model="gpt-5-mini",
        input=[
            {"role": "system", "content": GIVEBOX_CHECK_INSTRUCTIONS},
            {"role": "user", "content": build_user_content_givebox_check(image_url)},
        ],
        text_format=ItemList,
    )

    # Überprüfen, ob eine Givebox erkannt wurde
    if not any(item.category == "givebox_ok" for item in resp.output_parsed.items):
        print("Keine Givebox auf dem Bild erkannt. Programm wird beendet.")
        return

    # Objekte erkennen
    resp = client.responses.parse(
        model="gpt-5-mini",
        input=[
            {"role": "system", "content": SYSTEM_INSTRUCTIONS},
            {"role": "user", "content": build_user_content(image_url)},
        ],
        text_format=ItemList,
    )

    items = resp.output_parsed.items

    # Deduplikation (gleiche Namen ignorieren)
    seen = set()
    clean = []
    for i in items:
        key = i.name.strip().lower()
        if key in seen:
            continue
        seen.add(key)
        clean.append(i)

    # Konsolenausgabe
    for i in clean:
        line = f"- {i.name} [{i.category}]"
        print(line)

    # Markdown-Datei speichern
    save_json(clean)


if __name__ == "__main__":
    if not os.environ.get("OPENAI_API_KEY"):
        print("Bitte OPENAI_API_KEY als Umgebungsvariable setzen.")
    else:
        main()
