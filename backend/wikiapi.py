#!/usr/bin/python3

import csv
import re
import sys
import logging
import requests
import pyfiglet
import random
from datetime import datetime

from read_data import get_structured_data, get_json_from_wiki_table

S = requests.Session()

URL = "https://www.muenster4you.de/w/api.php?"


def search(query):
    params_get = {
        'action': 'query',
        'list': 'search',
        'srsearch': query,
        'srwhat': 'text',
        'format': 'json'
    }

    res = S.get(url=URL, params=params_get)
    data = res.json()
    results = data['query']['search']
 
    return results


def getAll():
    give_boxes = get('Sharing/GiveBoxen', True)
    books = get('Sharing/Bücherschränke', True)

    return give_boxes + books

def get(poi, allFormat = False):
    params_get = {
        'action': "parse",
        'page': poi,
        'prop': 'wikitext',
        'format': "json"
    }
    res = S.get(url=URL, params=params_get)
    data = res.json()
    
    if 'error' in data.keys(): return {'error': 'invalid poi'}
    
    wikitext = data['parse']['wikitext']['*']
    if not allFormat: wikitext = get_structured_data(wikitext)    
    else: wikitext = get_json_from_wiki_table(wikitext)
    
    print('curr', wikitext['Vorschaubild'])


    wikitext['Vorschaubild'] = _get_image_urls(wikitext['Vorschaubild'])
    wikitext['Weitere Fotos'] = _get_image_urls(wikitext['Weitere Fotos'])

    return wikitext

def alter_contents(location, items):   
    params_get = {
        'action': "query",
        'meta': "tokens",
        'type': "login",
        'format': "json"
    }
    res = S.get(url=URL, params=params_get)
    data = res.json()
    token = data['query']['tokens']['logintoken']

    return data


def _get_image_urls(images):
    image_names = [f"Datei:{name.split('|')[0]}" for name in images]

    print(image_names, images)

    params_get = {
      'action': 'query',
      'titles': image_names,
      'prop': 'imageinfo',
      'iiprop': 'url',
      'format': 'json',
      'formatversion': 2
    }
    res = S.get(url=URL, params=params_get)
    data = res.json()

    return [url['imageinfo'][0]['url'] for url in data['query']['pages']]



