const sh = require('shelljs');
const fs = require('fs');
const path = require('path');

const dirs = [
  '.',
  'blog',
  'blog/p',
  'p',
  'projects',
  'tools',
]

const build = () => {
  checkDeps();
  compileSass();
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

const compileSass = () => {
  sh.exec('sass assets/style/main.scss assets/style/main.css');
}

const doBeautify = () => {
  prepStyle();
  purifyStyle()
    .then((success) => {
      console.log('Purification complete');
      removeTmp();
    }, (err) => {
      console.error(err);
      removeTmp();
    });
}

const prepStyle = () => {
  sh.mkdir('tmp');
  sh.mv('assets/style/main.css', 'tmp/m.css');
}

const purifyStyle = async () => {
  const whitelist = await getHtmlFiles();
  const cmd = `node_modules/purify-css/bin/purifycss --min --info --out assets/style/main.css tmp/m.css ${whitelist}`;
  console.log(cmd);
  sh.exec(cmd);
}

const getHtmlFiles = async () => {
  let fileList = [];
  let files;
  for (let d of dirs) {
    files = await getFiles(d);
    files = files
      .filter(f => path.extname(f) === '.html')
      .map((f) => `${d}/${f}`);
    fileList.push(files);
  }
  return stringifySpaces(fileList);
}

const getFiles = (dir) => new Promise((resolve, reject) => {
  console.log(`reading ${dir} for HTML files...`);
  fs.readdir(dir, (err, files) => {
    if (err) {
      reject(err);
    } else {
      resolve(files);
    }
  });
});

const stringifySpaces = (arr) => {
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
}

const removeTmp = () => {
  sh.rm('-rf', './tmp');
}

module.exports = build;

/* Now time for the fun */
build();
