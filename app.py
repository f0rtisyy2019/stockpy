import os
import pandas as pd
import numpy as np

import sqlalchemy
from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flaskext.mysql import MySQL
from scraping import scrape

app = Flask(__name__)

# Database Setup
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:f0rtisyy@localhost/stockpy"
db = SQLAlchemy(app)

class symbols(db.Model):
    symbol = db.Column(db.String(10), primary_key=True)
    stock_name = db.Column(db.String(80), unique=True)

    def __init__(self, symbol, stock_name):
        self.symbol = symbol
        self.stock_name = stock_name

    def __repr__(self):
        return self.symbol

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/ticker")
def ticker():
    """Return a list of symbol names."""
    symb = [str(sy) for sy in symbols.query.all()]
    return jsonify(symb)

@app.route('/scrape')
def topGainLose():
    return jsonify(Stocks=scrape())

if __name__ == "__main__":
    app.run()
