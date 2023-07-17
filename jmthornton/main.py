"""Jmthornton.net main."""

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def root_index():
    """Site root."""
    return render_template("index.html")


@app.route("/tools/")
def tools():
    """Tools root."""
    pass


@app.route("/robots.txt")
def robots():
    """Robots file."""
    return """User-agent: *
Disallow: /czshrnw/
Disallow: /p/museum/
Sitemap: https://jmthornton.net/sitemap.xml"""


@app.route("/p/sitemap.xml")
def sitemap():
    """Sitemap."""
    # TODO
    return '<?xml version="1.0" encoding="UTF-8"?>'


@app.errorhandler(404)
def page_not_found(e):
    """404 page."""
    return render_template("404.html"), 404
