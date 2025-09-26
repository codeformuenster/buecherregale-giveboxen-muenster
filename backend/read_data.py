import re
import json

#data = '== Josefskirchplatz: ==\n\n=== Allgemeine Infos: ===\n\n* Name: Josefskirchplatz\n* Adresse: Hammer Stra\u00dfe/Josefskirchplatz\n\n=== Weitere Infos: ===\n\n* Typ: Givebox\n* Latitude: 51.9498914\n* Longitude: 7.6247309\n* \u00d6ffnungszeiten: immer\n* Betreiber: -\n* Link: https://www.st-joseph-muenster-sued.de/caritas-hilfe/givebox-an-der-josephs-kirche\n\n=== Fotos: ===\n[[Datei:Vorschau.jpg|zentriert|mini|Vorschaubild]]\n[[Datei:Inhalt Josef.jpg|zentriert|mini|Der aktuellste Stand der Give-Box]]\n\n=== Aktuelles Sortiment: ===\n{| class=\"wikitable\"\n|+\n!Tag\n!Beschreibung\n|-\n|Teller\n|Ein paar gestapelte Teller\n|-\n|Decken\n|Rote und wei\u00dfe Bettdecken\n|-\n|B\u00fccher\n|Gro\u00dfe Romane\n|}'

# 1️ Alle Sektionen extrahieren
def parse_sections(data):
    matches = re.findall(r"===+\s*(.*?)\s*===+\s*\n*(.*?)(?=(?:===+|$))", data, re.S)
    sections = {}
    for title, content in matches:
        sections[title.strip()] = content.strip()
    return sections

# 2️ Tabelle sauber parsen
def parse_table(content):
    table = []
    lines = content.splitlines()
    current_row = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith(("{|", "|+", "|-","!")):
            continue  # Steuerzeichen ignorieren
        if line.startswith("|"):
            current_row.append(line[1:].strip())
            # Wenn wir zwei Zellen pro Zeile erwarten, kannst du hier appenden
            # Alternativ: alle gesammelten Zellen am Ende einer Zeile hinzufügen
            if len(current_row) == 2:
                table.append(current_row)
                current_row = []
    return table


# 3️ Strukturierte Umwandlung
def structured_parse(sections):
    result = {}
    for title, content in sections.items():
        content = content.strip()
        
        # Key-Value-Liste
        if content.startswith("*"):
            kv_pairs = dict(re.findall(r"\* (.*?): (.*)", content))
            result[title] = kv_pairs
        # Bilder
        elif "[[Datei:" in content:
            images = re.findall(r"\[\[Datei:(.*?)\]\]", content)
            result[title] = images
        # Tabelle
        elif "{|" in content:
            result[title] = parse_table(content)
        else:
            result[title] = content
    return result


def remove_empty_sections(data_dict):
    return {k: v for k, v in data_dict.items() if v not in ("", [], {})}




def get_structured_data(data):
    sections = parse_sections(data)
    structured = structured_parse(sections)
    structured = remove_empty_sections(structured)

    return structured





def get_json_from_wiki_table(data):
    """ Convert a simple wiki table to JSON format """
    lines = data.split('\n')
    entries = []
    current = {}

    for line in lines:
        line = line.strip()
        if line.startswith('|-'):
            if current:  # Vorherigen Eintrag speichern
                entries.append(current)
            current = {}
        elif line.startswith('|'):
            value = line[1:].strip()

            # Wiki-Link bereinigen: [[Link|Name]] → Name
            #match = re.match(r'\[\[.*\|(.*)\]\]', value)
            #if match:
            #    value = match.group(1)

            if 'Bezeichnung / ID' not in current:
                current['Bezeichnung / ID'] = value
            elif 'Adresse' not in current:
                current['Adresse'] = value
            elif 'Latitude' not in current:
                current['Latitude'] = float(value)
            elif 'Longitude' not in current:
                current['Longitude'] = float(value)
            elif 'Kategorie' not in current:
                current['Kategorie'] = value

    # Letzten Eintrag hinzufügen
    if current:
        entries.append(current)

    return entries





#print(get_structured_data(data))
