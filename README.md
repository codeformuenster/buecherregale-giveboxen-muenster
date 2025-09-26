# buecherregale-giveboxen-muenster

Münsterhack 2025 Projekt Repository

# Hook / Problem:
- „Giveboxen sind ein großartiges, nachhaltiges Konzept – Dinge werden geteilt statt weggeschmissen.“
- „Aber aktuell funktioniert die Nutzung eher wie ein Glücksspiel: Man geht hin, stöbert – und findet vielleicht etwas. Eine gezielte Suche ist kaum möglich.“

# Lösung:
-„Unsere Idee: Wir machen Giveboxen digital durchsuchbar.“
-„Nutzer scannen den QR-Code an der Box, laden ein Foto hoch, und eine KI erkennt automatisch die Gegenstände.“
-„Der Inhalt wird als Text und Kategorien ins Wiki übernommen und ist sofort für alle durchsuchbar.“

# Funktionsweise:
1. User scannt QR-Code an Givebox
2. Foto hochladen
3. KI → erkennt Objekte & erstellt Eintragsliste
4. Daten → ins Wiki / Plattform gespeichert
5. Ergebnis → Suchbar per Text, Filter, Kategorien

# Mehrwert:
-Für Nutzer:
  * Gezieltes Suchen nach Dingen, statt zufälliges Stöbern
  * Bequem von zuhause checken, ob sich der Weg zur Box lohnt

# Zukunft / Vision:
-„Um die Community zum Mitmachen zu motivieren, bauen wir Gamification ein: Badges für fleißige Uploader, Ranglisten, vielleicht sogar kleine Belohnungen durch Partner.“
- „So schaffen wir eine digitale Infrastruktur für Giveboxen, die nachhaltig, skalierbar und community-getrieben ist.“
- Einbinden der Website in bestehende Karten zB GoogleMaps

# Abschluss:
-„Kurz gesagt: Wir machen Giveboxen smarter. Von Zufallsfund zu gezieltem Fund, dank KI, Crowd-Daten und einfacher Suche.“
- „Damit wird Nachhaltigkeit nicht nur praktisch, sondern auch digital zugänglich.“

# Technische Infos

Link zu den Daten: https://www.muenster4you.de/wiki/Sharing


## Überlegungen zur Datenstruktur im Wiki

```bash

    - Mehrere Listen-Seiten mit Tabellen drauf: 
        - Give Boxen
        - Bücherregale
        - Hofläden

    - 3 Seiten mit Tabellen. Details der Tabellen: 
        - ID
        - Name
        - Adresse
        - Link zur Detailseite mit Box-Details (s.u.)

    - 100 Seiten mit Box-Details: 
        - Latitude/Longitude
        - Öffnungszeigen & Besonderheiten
        - Typ der Box (Givebox, Bücherregal, )
        - Sortiment (per KI aus dem Inhalt erkannt)
        - Fotos
            - Vorschaubild
            - Fotos vom Inhalt
```

## Frontend
Technologie
- React

Seiten
- Startseite / Karte    
    - Karte wie google Maps
    - Oben Suchleiste
    - Darunter kann man Stichworte auswählen
    - Mitte = Karte mit Pins
- Liste mit Suchergebnissen
- Detailseite
    - Infos
    - Fotos
    - Button "Foto machen"
- Infoseite
    - Neue Box anlegen - Button

Benötigte API Endpunkte: 
- JSON
- Startseite = Liste der POIs
- Suche-Endpunkt = Gefilterte Liste mit POIs
    - per Kategorie 
    - Suche nach Freitext
- Details einer Givebox
- QR-Codes generieren


Detailseite angelegt und Fotos hochgeladen: 
* Sharing/Bücherschränke/Arkaden
* Sharing/Bücherschränke/Rosenplatz
* Sharing/Bücherschränke/Hiltrup Osttor
* Sharing/Bücherschränke/HiltrupMarktallee
* Sharing/GiveBoxen/Josefskirchplatz
* Sharing/GiveBoxen/HausMariengrund
* Sharing/GiveBoxen/Hiltrup
* Sharing/Bücherschränke/HiltrupMeesenstiege
* Sharing/Bücherschränke/FHMünster
* Sharing/GiveBoxen/Gievenbeck
* Sharing/GiveBoxen/Gremmendorf
