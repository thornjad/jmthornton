const sh = require('shelljs');

const build = require('./build');
const pkg = require('./package.json');

const pack = () => {
  build();
  checkDeps();
  commitPrep()
    .then(updateVersions());
}

const checkDeps = () => {
  if (!sh.which('git')) {
    console.error('building requires git, please install git');
    sh.exit(1);
  }
}

const commitPrep = () => {
  return new Promise((resolve, reject) => {
    sh.exec('git add -A');
    sh.exec('git commit -m "Prepare next release"');
    resolve();
  });
}

const updateVersions = () => {
  versionNode();
  pushAll();
}

const versionNode = () => {
  const versionType = process.argv[2];
  sh.exec(`npm version ${versionType}`);
}

const pushAll = () => {
  sh.exec('git push');
}
