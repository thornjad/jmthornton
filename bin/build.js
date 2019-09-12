'use strict';

const sh = require('shelljs');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const sass = require('sass');
const Fiber = require('fibers');

require('filefile');

const dirs = ['.', 'blog', 'blog/p', 'blog/r', 'blog/recipes', 'p', 'projects', 'tools', 'tools/news', 'lib'];

const build = async () => {
  await compileSass();
	console.info('Completed sass build');
  checkDeps();
  doPurify();
};

const checkDeps = () => {
  if (!sh.which('node_modules/.bin/purifycss')) {
    console.error('Try `npm install` first');
    sh.exit(1);
  }
};

const compileSass = async () => {
	return new Promise((resolve, reject) => {
		const styleDir = 'assets/style';
		const file = `${styleDir}/main.scss`;
		const outFile = `${styleDir}/main.css`;
		const sourceMap = `${styleDir}/main.map`;

		sass.render({
			file, outFile, sourceMap,
			fiber: Fiber,
		}, (err, result) => {
			if (err) {
				reject(err);
			} else {
				fsp.writeFile(outFile, result.css).then(() => {
					console.info(`gave sass to ${outFile}`);
					resolve();
				}, (reason) => {
					reject(reason);
				});
			}
		});
	});
};

const doPurify = () => {
  purifyStyle().catch(err => {
    console.error(err);
  });
};

const purifyStyle = async () => {
  const whitelist = await getContentFiles();
  const cmd = `node_modules/.bin/purifycss --min --info assets/style/main.css ${whitelist} --out assets/style/main.css`;
  sh.exec(cmd);
};

const getContentFiles = async () => {
  let fileList = [];
  let files;
  for (let d of dirs) {
    files = await getFiles(d);
    files = files.filter(f => path.extname(f) === '.html' || path.extname(f) === '.js').map(f => `${d}/${f}`);
    fileList.push(files);
  }
  return stringifySpaces(fileList);
};

// TODO move this to fsp
const getFiles = dir => new Promise((resolve, reject) => {
  console.log(`reading ${dir} for content files...`);
  fs.readdir(dir, (err, files) => {
    if (err) {
      reject(err);
    } else {
      resolve(files);
    }
  });
});

const stringifySpaces = arr => {
  let str = '';
  let i = 0;
  while (i < arr.length) {
    const val = arr[i];
    if (Array.isArray(val)) {
      str += `${stringifySpaces(val)} `;
    } else {
      str += `${val} `;
    }
    i++;
  }
  return str;
};

module.exports = build;

/* Now time for the fun */
build().then(() => {
	console.log('Completed build');
}, (reason => {
	console.error(reason);
}));
