// @flow

const sh = require('shelljs');
const fs = require('fs');
const path = require('path');

const dirs: Array<string> = [
  '.',
  'blog',
  'blog/p',
  'p',
  'projects',
  'tools',
  'tools/news'
]

const build = (): void => {
  checkDeps();
  compileSass();
  compileJS();
  doBeautify();
}

const checkDeps = (): void => {
  if (!sh.which('sass')) {
    console.error('building requires Sass, please install Sass');
    sh.exit(1);
  }
  if (!sh.which('node_modules/purify-css/bin/purifycss')) {
    console.error('Try `npm install` first');
    sh.exit(1);
  }
}

const compileSass = (): void => {
  sh.exec('sass assets/style/main.scss assets/style/main.css');
}

const doBeautify = (): void => {
  prepStyle();
  purifyStyle()
    .then((): void => {
      removeTmp();
    }, (err: mixed): void => {
      console.error(err);
      removeTmp();
    });
}

const prepStyle = (): void => {
  sh.mkdir('tmp');
  sh.mv('assets/style/main.css', 'tmp/m.css');
}

const purifyStyle = async (): Promise<void> => {
  const whitelist: string = await getHtmlFiles();
  const cmd: string = `node_modules/purify-css/bin/purifycss --min --info --out assets/style/main.css tmp/m.css ${whitelist}`;
  sh.exec(cmd);
}

const getHtmlFiles = async (): Promise<string> => {
  let fileList: Array<string | Array<*>> = [];
  let files: mixed;
  for (let d of dirs) {
    files = await getFiles(d);
    files = files
      .filter(f => path.extname(f) === '.html')
      .map((f) => `${d}/${f}`);
    fileList.push(files);
  }
  return stringifySpaces(fileList);
}

const getFiles = (dir: string): Promise<*> => new Promise((resolve, reject) => {
  console.log(`reading ${dir} for HTML files...`);
  fs.readdir(dir, (err, files) => {
    if (err) {
      reject(err);
    } else {
      resolve(files);
    }
  });
});

const stringifySpaces = (arr: Array<Array<*> | string>): string => {
  let str: string = '';
  let i: number = 0;
  while (i < arr.length) {
    const val: string | Array<*> = arr[i];
    if (Array.isArray(val)) {
      str += `${stringifySpaces(val)} `;
    } else {
      str += `${val} `;
    }
    i++;
  }
  return str;
}

const removeTmp = (): void => {
  sh.rm('-rf', './tmp');
}

const compileJS = (): void => {
  console.log('compiling main site scripts');
  sh.exec('babel assets/script/src/ -d assets/script/lib/');
  console.log('compiling news site scripts');
  sh.exec('babel tools/news/assets/script/src -d tools/news/assets/script/lib');
}

module.exports = build;

/* Now time for the fun */
build();
