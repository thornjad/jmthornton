# What's new in ECMAScript 2017

## Jade Thornton | September 28, 2017

Two years ago, ES6 (retconned to ECMAScript 2015) provided a massive update to the existing and already powerful ECMAScript standard. Incredibly useful features like `const`, `let`, arrow functions and destructuring syntax were unleashed upon the world. Another big change was the new yearly release schedule based on [proposals](https://github.com/tc39/proposals) are ready to ship as of the [TC39](https://github.com/tc39) meeting. The next annual release, ECMAScript 2016, wasn't much to gawk at in comparison, adding only two new features ([Array.protoype.includes](https://github.com/tc39/Array.prototype.includes) and the [exponentiation operator](https://github.com/rwaldron/exponentiation-operator)) and a handful of changes to the existing standard.

The newly released [ECMAScript 2017](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf) is somewhere in between, not being a massive update, but adding a sizeable number of features and changes. Let's take a look at all the new additions in this year's release.

### Object.values and Object.entries

### String padding

This new feature is relatively small, but comes to the rescue for npm and Node itself. If you don't remember, March 2016 saw [a bit of a crisis](http://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/) where a widely used (even by Node and Babel) package called `left-pad` was unpublished from npm and crippled developers everywhere. This new ECMAScript feature makes the package unneeded. You can use it to easily format string output so the string reaches the given length:

```
'foobaring foo'.padStart(20);       // "       foobaring foo"
'foobaring foo'.padStart(20, '#');  // "#######foobaring foo"

'foobaring foo'.padEnd(20);         // "foobaring foo       "
'foobaring foo'.padEnd(20, '#');    // "foobaring foo#######"
```

[MDN: String.prototype.padStart()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart)

[MDN: String.prototype.padEnd()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd)

### Object.getOwnPropertyDescriptors

### Trailing commas in function parameter lists and calls

### Async functions

### Shared memory and atomics
