'use strict';

const sh = require('shelljs');
const fs = require('fs');
const path = require('path');
require('filefile');

const dirs = ['.', 'blog', 'blog/p', 'p', 'projects', 'gallery', 'assets/script/lib', 'tools', 'tools/news'];

const build = () => {
  checkDeps();
  compileSass();
  compileJS();
  doPurify();
};

const checkDeps = () => {
  if (!sh.which('sass')) {
    sh.exit(1);
  }
  if (!sh.which('node_modules/.bin/purifycss')) {
    sh.exit(1);
  }
};

const compileSass = () => {
  sh.exec('sass assets/style/main.scss assets/style/main.css');
};

const doPurify = () => {
  prepStyle();
  purifyStyle().then(() => {
    removeTmp();
  }, err => {
    removeTmp();
  });
};

const prepStyle = () => {
  sh.mkdir('tmp');
  sh.mv('assets/style/main.css', 'tmp/m.css');
};

const purifyStyle = async () => {
  const whitelist = await getContentFiles();
  const cmd = `node_modules/purify-css/bin/purifycss --min --info --out assets/style/main.css tmp/m.css ${whitelist}`;
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

const getFiles = dir => new Promise((resolve, reject) => {
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

const removeTmp = () => {
  sh.rm('-rf', './tmp');
};

const compileJS = () => {
  sh.exec('babel assets/script/src/ -d assets/script/lib/');

  sh.exec('babel tools/news/assets/script/src -d tools/news/assets/script/lib');
};

module.exports = build;

/* Now time for the fun */
build();
