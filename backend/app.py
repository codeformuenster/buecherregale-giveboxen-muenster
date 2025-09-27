from flask import Flask, request, jsonify
import wikitable2csv
import wikiapi
from backend.ki_demo import givebox

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



@app.route('/givebox/analyze', methods=['POST'])
def givebox_analyze():
    """
    Multipart (image) ODER JSON {"url": "..."} akzeptieren.
    Optional: ?no_gate=1 & ?no_bbox=1
    """
    no_gate = request.args.get('no_gate') == '1'
    no_bbox = request.args.get('no_bbox') == '1'

    img_bytes = None
    # 1) Datei-Upload (multipart/form-data, field name: "image")
    if 'image' in request.files:
        file = request.files['image']
        img_bytes = file.read()
    # 2) Oder per URL im JSON
    elif request.is_json and 'url' in request.json:
        import requests
        r = requests.get(request.json['url'], timeout=20)
        r.raise_for_status()
        img_bytes = r.content
    else:
        return jsonify({"error": "provide image (multipart 'image') or JSON {'url': ...}"}), 400

    try:
        if no_gate:
            data = givebox.analyze_image(
                image_bytes=img_bytes,
                use_bbox=not no_bbox,
            )
        else:
            data = givebox.analyze_image_with_gate(
                image_bytes=img_bytes,
                use_bbox=not no_bbox,
            )
        # bei Gate negativ sinnvollen HTTP-Code setzen (422)
        if not no_gate and data.get("gate_status") == "givebox_not_ok":
            return jsonify(data), 422
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

