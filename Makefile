.PHONY: all cloudflare-build prism style dev build feed

all: cloudflare-build

cloudflare-build: style feed build

prism:
	npx purify-css --min --info public/assets/vendor/prism.css public/assets/vendor/prism.js --out public/assets/vendor/prism.min.css
	npx purify-css --min --info public/assets/vendor/prism-dark.css public/assets/vendor/prism.js --out public/assets/vendor/prism-dark.min.css

style: prism

dev: prism
	npm run dev

build:
	npm run build

feed:
	pip3 install -r requirements.txt
	python3 bin/feed.py
