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

      data_formatted.append({'title': title[2], 'link': f"https://www.muenster4you.de/wiki/{'/'.join(title)}", 'found_in': element_raw['snippet']})

    # data = [element for element in data_raw if element['title'].startswith('Sharing')]    

    

    return {'data': data_formatted}  
 
@app.route('/get')
def get():
    poi = request.args.get('poi')
    if poi == None: return {'error': 'invalid query'}

    data = wikiapi.get(poi)

    return {'data': data}
 
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
