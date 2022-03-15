.PHONY: all sass purifycss run

sass:
	sass assets/style/src/main.scss assets/style/main.css

sass-watch:
	sass --watch assets/style/src/main.scss assets/style/main.css

purifycss:
	npx purify-css --min --info assets/vendor/prism.css assets/vendor/prism.js --out assets/vendor/prism.min.css
	npx purify-css --min --info assets/vendor/prism-dark.css assets/vendor/prism.js --out assets/vendor/prism-dark.min.css
	npx purify-css --min --info assets/style/main.css $(shell find . -type f -name '*.html') --out assets/style/main.css

all: sass purifycss

run:
	npx http-server -o -c-1

watch: sass-watch run
