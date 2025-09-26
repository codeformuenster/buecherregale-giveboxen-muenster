#!/usr/bin/python3

"""
    Wiki Tabelle in CSV verandeln
"""

import csv
import re
import sys
import logging
import requests
import pyfiglet
import random
from datetime import datetime

# Basic logger configuration
logging.basicConfig(level=logging.DEBUG, format='<%(asctime)s %(levelname)s> %(message)s')
logging.addLevelName(logging.WARNING, f"\033[1;31m{logging.getLevelName(logging.WARNING)}\033[1;0m")
logging.addLevelName(logging.ERROR, f"\033[1;41m{logging.getLevelName(logging.ERROR)}\033[1;0m")
logging.info("=====> START %s <=====", datetime.now())

# Nicer log files with random fonts
HEADLINE_FONT = random.choice(pyfiglet.FigletFont.getFonts())
logging.debug("(headline font = '%s')", HEADLINE_FONT)


S = requests.Session()

URL = "https://www.muenster4you.de/w/api.php?"



def get_content(page_title):
    """ Fetch a remote wiki page, return its content
    """

    params_get = {
        'action': "parse",
        'page': page_title,
        'prop': 'wikitext',
    #    'section': 5,
        'format': "json"
    }
    res = S.get(url=URL, params=params_get)
    data = res.json()
    wikitext = data['parse']['wikitext']['*']
    return wikitext


def parse_columns(currentrow, char):
    """ Parse a wiki table columnn
    """
    # table columns on one line, separated by "|"
    if f"{char}{char}" in currentrow:
        columns = currentrow[1:].split(f"{char}{char}")
    # table columns on many lines, separated by "||"
    else:
        columns = currentrow[1:].split(char)

    return map(str.strip, columns)


def write_csv(outputfilename, wikitext):
    """ Extract table data and save it to a CSV file
    """

    # wikitext = wikitext.replace("\n", "")
    # logging.debug("Found wikitext *********%s*********", wikitext.replace("\n", ""))
    rawtablematch = re.match(r".*\{\|(.*?)\|\}.*", wikitext, flags=re.I | re.DOTALL | re.MULTILINE )
    if rawtablematch:
        rawtable = rawtablematch.group(1)
        logging.debug("found table %s", rawtable.replace("\n", ""))
        tablerows = rawtable.split('|-')

        rownr = 0
        entries = []
        for currentrow in tablerows:
            logging.debug("found row %s", currentrow.replace("\n", ""))

            if re.search(r'(class=|style=)', currentrow):
                currentrow = re.sub(r'(class|style)=".*?"\s*'," ", currentrow)
                logging.debug("removed class & style")

            if ("rowspan=" in currentrow) or ("colspan=" in currentrow):
                logging.warning("Skipping row! Contains row-/colspan.")
            else:
                currentrow = currentrow.strip()
                if currentrow.startswith("|+"):
                    logging.debug("Ignoring caption row")
                elif currentrow.startswith("|"):
                    entries.append(parse_columns(currentrow, "|"))
                elif currentrow.startswith("!"):
                    entries.append(parse_columns(currentrow, "!"))
                else:
                    if rownr == 0:
                        logging.debug("Ignoring first row")
                    else:
                        raise ValueError("Row has broken content")
            rownr=rownr+1

        with open(outputfilename, "w") as file:
            writer = csv.writer(file)
            writer.writerows(entries)
    else:
        raise ValueError("Did not find table in wiki content")




if __name__ == '__main__':

    if len( sys.argv ) > 2:
        input_file_or_page_name = sys.argv[1]
        output_filename = sys.argv[2]

        if re.match(r'.*\.md', input_file_or_page_name):
            with open(input_file_or_page_name, 'r') as file:
                file_content = file.read() # .replace('\n', '')
                write_csv(output_filename, file_content)

        else:
            wiki_content = get_content(input_file_or_page_name)
            write_csv(output_filename, wiki_content)

    else:
        raise ValueError("Needs 2 input Parameters\n\nParse Mediawiki Table Markdown and write CSV file of it\n=========================================================\n\nUsage: wikitable2csv.py Inputwikipagename_or_Filename Outputfilename\n\ne.g. python3 wikitable2csv.py Hofläden hoflaeden-muenster.csv\n     python3 wikitable2csv.py test/wikitable.md table-test.csv\n\nCurrent Mediawiki-Url: " + URL + "\n")
