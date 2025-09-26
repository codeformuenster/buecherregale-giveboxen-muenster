#!/usr/bin/python3

import csv
import re
import sys
import logging
import requests
import pyfiglet
import random
from datetime import datetime

from read_data import get_structured_data

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


def get(poi):
    if poi == None: poi = 'Sharing/GiveBoxen'

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
    if poi != None: get_structured_data(wikitext)    

    return wikitext

def alter_contents(new_contents):   
    params_get = {
        'action': "query",
        'meta': "tokens",
        'type': "login",
        'format': "json"
    }
    res = S.get(url=URL, params=params_get)
    data = res.json()

    return data
