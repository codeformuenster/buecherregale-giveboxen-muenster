#!/usr/bin/python3

import csv
import re
import sys
import logging
import requests
import pyfiglet
import random
from datetime import datetime

from read_data import get_structured_data, get_json_from_wiki_table, build_wiki_page

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
      wikitext["id"] = poi


    return wikitext

def add_data(location, items, image):   
    token = _login()
    
    filename = f"{location}{items['generated_at']}.jpg"
    params_post = {
      "action": "upload",
      "filename": filename,
      "format": "json",
      "token": token,
      "ignorewarnings": 1
    }
    file = {'file':(filename, image, 'multipart/form-data')}

    res = S.post(URL, files=file, data=params_post)
    data = res.json()
    
    new_page = build_wiki_page(get(location), items, filename)
    
    params_post = {
      "action": "edit",
      "title": location,
      "text": new_page,
      "token": token,
    }
 
    res = S.post(URL, data=params_post)

    return res


def _login():
    r = S.get(URL, params={
      "action": "query",
      "meta": "tokens",
      "type": "login",
      "format": "json"
    })
    print(r)
    login_token = r.json()["query"]["tokens"]["logintoken"]

    print("Login:", r.json())

    # 2) Login with BotPassword
    r = S.post(URL, data={
      "action": "login",
      "format": "json",
      "lgname": "Upload Bot@Upload_Bot",      # bot username
      "lgpassword": "tvhemegicppd2395a82b5h32rbt39u6n",  # bot password
      "lgtoken": login_token
    })
    print("Login:", r.json())

    # 3) Get a CSRF token
    r = S.get(URL, params={
      "action": "query",
      "meta": "tokens",
      "type": "csrf",
      "format": "json"
    })
    csrf_token = r.json()["query"]["tokens"]["csrftoken"]

    print("CSRF token:", r.json())


    return csrf_token

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



