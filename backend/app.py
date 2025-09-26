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

    data = wikiapi.search(query)
    return {'data': data}  
  
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
