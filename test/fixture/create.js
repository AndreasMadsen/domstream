/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var common = require('../common.js');
var domstream = common.domstream;

function parseFile(path) {
  var document = domstream(fs.readFileSync(path, 'utf8'));

  var parrentFree = common.removeParent(document.tree);
  console.log();
  console.log();
  console.log(JSON.stringify(parrentFree));
  console.log(common.parsed);
  console.log();

  fs.writeFileSync(path.slice(0, path.length - 5) + '.json', JSON.stringify(parrentFree));
}

parseFile(common.benchmark.small.html);
parseFile(common.benchmark.big.html);

console.log('write file');
