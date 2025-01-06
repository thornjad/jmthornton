.PHONY: sass style dev prism main blog tools zoo

sass:
	sass assets/style/src/main.scss assets/style/out.css

sass-watch:
	sass --watch assets/style/src/main.scss assets/style/main.css

prism:
	npx purify-css --min --info assets/vendor/prism.css assets/vendor/prism.js --out assets/vendor/prism.min.css
	npx purify-css --min --info assets/vendor/prism-dark.css assets/vendor/prism.js --out assets/vendor/prism-dark.min.css

	mkdir -p blog/assets/vendor
	cp assets/vendor/prism.min.css blog/assets/vendor/prism.min.css
	cp assets/vendor/prism-dark.min.css blog/assets/vendor/prism-dark.min.css
	cp assets/vendor/prism.js blog/assets/vendor/prism.js

# Purify all CSS referencing all usage except blog
main: sass
	npx purify-css --min --info assets/style/out.css $(shell find . -type d \( -path ./blog -o -path ./node_modules -o -path ./tools \) -prune -o -type f -name '*.html' -print) --out assets/style/main.css

blog: sass
	mkdir -p blog/assets/style
	npx purify-css --min --info assets/style/out.css $(shell find ./blog -type f -name '*.html' -print) --out blog/assets/style/main.css

tools: sass
	npx purify-css --min --info assets/style/out.css $(shell find ./tools -type d \( -path ./tools/news -o -path ./tools/libertarian-zoo \) -prune -o -type f -name '*.html' -print) --out tools/tools.css

news: sass
	npx purify-css --min --info assets/style/out.css $(shell find ./tools/news -type f -name '*.html' -print) --out tools/news/news.css

zoo: sass
	npx purify-css --min --info assets/style/out.css $(shell find ./tools/libertarian-zoo -type f -name '*.html' -print) --out tools/libertarian-zoo/main.css

style: prism main blog tools zoo news

copy-blog-fonts:
	mkdir -p blog/assets/fonts
	cp -r assets/fonts blog/assets/fonts

all: style

server:
	npx http-server -c-1

dev: style
	make -j4 sass-watch server
