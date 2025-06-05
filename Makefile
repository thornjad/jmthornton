.PHONY: all prism style server feed

all: feed style

prism:
	npx purify-css --min --info assets/vendor/prism.css assets/vendor/prism.js --out assets/vendor/prism.min.css
	npx purify-css --min --info assets/vendor/prism-dark.css assets/vendor/prism.js --out assets/vendor/prism-dark.min.css

style: prism

server:
	npx http-server -c-1

feed:
	pip3 install feedgen bs4
	python3 bin/feed.py
