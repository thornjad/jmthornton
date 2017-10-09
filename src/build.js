const sh = require('shelljs');
const fs = require('fs');
const path = require('path');

const pkg = require('./package.json');

const dirs = [
  '.',
  'blog',
  'p',
  'projects',
  'tools',
]

const build = () => {
  checkDeps();
  doSass();
  doBeautify();

}

const checkDeps = () => {
  if (!sh.which('sass')) {
    console.error('building requires Sass, please install Sass');
    sh.exit(1);
  }
  if (!sh.which('node_modules/purify-css/bin/purifycss')) {
    console.error('Try `npm install` first');
    sh.exit(1);
  }
}

const doSass = () => {
  compileSass();
  removeSassMap();
}

const compileSass = () => {
  sh.exec('sass assets/style/main.scss assets/style/main.css');
}

const removeSassMap = () => {
  sh.rm('assets/style/main.css.map');
}

const doBeautify = () => {
  prepStyle();
  try {
    beautifyAndMinifyStyle();
  } catch (e) {
    console.error(e);
    sh.exit(1);
  }
  removeTmp();
}

const prepStyle = () => {
  sh.mkdir('tmp');
  sh.mv('assets/style/main.css', 'tmp/m.css');
}

const beautifyAndMinifyStyle = async () => {
  const whitelist = await getHtmlFiles();
  const whitelistString = stringify(whitelist);
  const cmd = `node_modules/purify-css/bin/purifycss --min --info --rejected --out assets/style/main.css ${whitelistString}`;
  sh.exec(cmd);
}

const getHtmlFiles = async () => {
  let fileList = [];
  for (let d of dirs) {
    const files = await getFiles(d);
    files = files.filter(f => path.extname(f) === '.html');
    fileList.push(files);
  }
  return flatten(fileList);
}

const getFiles = (dir) => new Promise((resolve, reject) => {
  fs.readdir(dir, (err, files) => {
    if (err) reject(err);
    else resolve(files);
  });
});

const flatten = (arr) => {
  let out = [];
  let i = 0;
  while (i < arr.length) {
    const val = arr[i];
    if (Array.isArray(val)) {
      flatten(val);
    } else {
      out.push(val);
    }
    i++;
  }
  return out;
}

const stringifySpaces = (arr) => {
  let str = '';
  for (let el of arr) {
    str += `${el} `;
  }
  return str;
}

const removeTmp = () => {
  sh.rm('-rf', 'tmp');
}

module.exports = build;
