.PHONY: dev prism

prism:
	npx purify-css --min --info assets/vendor/prism.css assets/vendor/prism.js --out assets/vendor/prism.min.css
	npx purify-css --min --info assets/vendor/prism-dark.css assets/vendor/prism.js --out assets/vendor/prism-dark.min.css

style: prism

all: style

server:
	npx http-server -c-1

dev: style
	make -j4 sass-watch server
