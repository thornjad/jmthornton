'use strict';

const fs = require('fs');
const md = require('markdown').markdown;

if (process.argv[2] === undefined) {
  process.exit(1);
} else {
  fs.readFile(process.argv[2], 'utf8', (err, data) => {
    if (err) throw err;
    if (process.argv[3] !== undefined) {
      fs.writeFile(process.argv[3], md.toHTML(data), err => {
        if (err) {
          throw err;
        }
      });
    } else {
      fs.writeFile('./a.html', md.toHTML(data), err => {
        if (err) {
          throw err;
        }
      });
    }
  });
}