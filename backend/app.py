from flask import Flask, request
import wikitable2csv
import wikiapi

app = Flask(__name__)


@app.get('/')
def index():
    data = wikitable2csv.get_content('Sicherheit')
    return data

@app.get('/search')
def search():
    query = request.args.get('query')
    if query == None: return {'error': 'invalid query'}

    data_raw = wikiapi.search(query)

    data_formatted = {}
    for element_raw in data_raw:
      title = element_raw['title'].split('/')
      if not title[0] == 'Sharing' or len(title) != 3: continue

      data_formatted['title'] = title[2]
      data_formatted['link'] = f"https://www.muenster4you.de/wiki/{'/'.join(title)}"
      data_formatted['found_in'] = element_raw['snippet']
      data_formatted['data'] = wikiapi.get(element_raw['title'])

    return {'data': data_formatted}  
 
@app.get('/get')
def get():
    poi = request.args.get('poi')
    data = wikiapi.get(poi)

    return {'data': data}
 
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

@app.post('/set_items')
def set_items():
    new_items = request.json()
    return {'data': wikiapi.set_contents(None)}     
