.PHONY: all sass purifycss build run

sass:
	sass assets/style/src/main.scss assets/style/main.css

sass-watch:
	sass --watch assets/style/src/main.scss assets/style/main.css

purifycss:
	npx purify-css --min --info assets/style/main.css $(shell find . -type f -name '*.html') --out assets/style/main.css

build: sass purifycss

run:
	npx http-server -o -c-1

watch: sass-watch run
