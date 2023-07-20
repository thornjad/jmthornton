"""Jmthornton.net main."""

from flask import Flask, render_template, send_from_directory

app = Flask(__name__)


@app.route("/")
def root_index():
    """Site root."""
    return render_template("index.html")


@app.route("/tools/")
def tools():
    """Tools root."""
    return render_template("tools/index.html")


@app.route("/tools/news/")
def news():
    """News."""
    return render_template("tools/news/index.html")


@app.route("/tools/libertarian-zoo/")
def libertarian_zoo():
    """Libertarian Zoo."""
    return render_template("tools/libertarian-zoo/index.html")


@app.route("/tools/libertarian-zoo/2020/")
def libertarian_zoo_2020():
    """Libertarian Zoo 2020."""
    return render_template("tools/libertarian-zoo/2020.html")


@app.route("/tools/jwt/")
def jwt():
    """JWT."""
    return render_template("tools/jwt.html")


@app.route("/tools/sponge/")
def sponge():
    """Sponge."""
    return render_template("tools/sponge.html")


@app.route("/tools/dencode/")
def dencode():
    """Dencode."""
    return render_template("tools/dencode.html")


@app.route("/tools/query-dumper/")
def query_dumper():
    """Query Dumper."""
    return render_template("tools/query-dumper.html")


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


@app.route("/favicon.ico")
def favicon_ico():
    """Favicon."""
    return app.send_static_file("images/favicon.ico")


@app.errorhandler(404)
def page_not_found(e):
    """404 page."""
    return render_template("404.html"), 404
