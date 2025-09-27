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
 
    if not allFormat: 
      if 'Vorschaubild' in wikitext: wikitext['Vorschaubild'] = _get_image_urls(wikitext['Vorschaubild'])
      if 'Weitere Fotos' in wikitext: wikitext['Weitere Fotos'] = _get_image_urls(wikitext['Weitere Fotos'])

    return wikitext

def add_data(location, items, image):   
    token = _login()
    
    params_post = {
      "action": "upload",
      "filename": f"{location}.jpg",
      "format": "json",
      "token": token,
      "ignorewarnings": 1
    }

    return token


def _login():
    params_get = {
        'action': "query",
        'meta': "tokens",
        'type': "login",
        'format': "json"
    }
    res = S.get(url=URL, params=params_get)
    data = res.json()
    token = data['query']['tokens']['logintoken']
    
    params_post = {
      "action": "login",
      "lgname": "Upload Bot@Upload_Bot",
      "lgpassword": "k8tipijfemikk7ulb03scc1jugl7i8jj",
      "format": "json",
      "lgtoken": token
    }

    res = S.post(url=URL, params=params_post)

    params_get = {
      "action": "query",
      "meta":"tokens",
      "format":"json"
    }

    res = S.get(url=URL, params=params_get)
    data = res.json()

    return data["query"]["tokens"]["csrftoken"]

def _get_image_urls(images):
    image_names = '|'.join([f"Datei:{name.split('|')[0]}" for name in images])
    
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



