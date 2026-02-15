.PHONY: all prism style dev build feed

all: style build feed

prism:
	npx purify-css --min --info public/assets/vendor/prism.css public/assets/vendor/prism.js --out public/assets/vendor/prism.min.css
	npx purify-css --min --info public/assets/vendor/prism-dark.css public/assets/vendor/prism.js --out public/assets/vendor/prism-dark.min.css

style: prism

dev:
	npm run dev

build:
	npm run build

feed:
	pip3 install feedgen bs4
	python3 bin/feed.py
