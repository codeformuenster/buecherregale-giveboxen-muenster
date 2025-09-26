from flask import Flask, request
import wikitable2csv
import wikiapi

app = Flask(__name__)


@app.route('/')
def index():
    data = wikitable2csv.get_content('Sicherheit')
    return data

@app.route('/search')
def search():
    query = request.args.get('query')
    if query == None: return {'error': 'invalid query'}

    data_raw = wikiapi.search(query)

    data_formatted = []
    for element_raw in data_raw:
      title = element_raw['title'].split('/')
      if not title[0] == 'Sharing' or len(title) != 3: continue

      element = {}
      element['title'] = title[2]
      element['link'] = f"https://www.muenster4you.de/wiki/{'/'.join(title)}"
      element['found_in'] = element_raw['snippet']
      element['data'] = wikiapi.get(element_raw['title'])

      data_formatted.append(element)

    return {'data': data_formatted}  
 
@app.route('/get')
def get():
    poi = request.args.get('poi')

    if poi == None: data = wikiapi.getAll()
    else: data = wikiapi.get(poi)

    return {'data': data}
 
@app.route('/set_items', methods = ['POST'])
def set_items():
    request_data = request.json

    location = request_data['location']
    items = request_data['items']

    return wikiapi.alter_contents(request_data, items)

    
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
