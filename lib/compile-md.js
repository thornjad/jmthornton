const fs = require('fs');
const md = require('markdown').markdown;

if (process.argv[2] === undefined) {
  console.error('I don\'t know what you want from me');
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
      console.log(`Markdown has been compiled into ${process.argv[3]}`);
    } else {
      fs.writeFile('./a.html', md.toHTML(data), err => {
        if (err) {
          throw err;
        }
      });
      console.log(`Markdown has been compiled to a.html`);
    }
  });
}