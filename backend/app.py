from flask import Flask
import wikitable2csv

app = Flask(__name__)


@app.route('/')
def index():
    data = wikitable2csv.get_content('Sicherheit')
    return data

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
