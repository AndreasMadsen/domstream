/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var common = require('../common.js');
var domstream = common.domstream;

function parseFile(path) {
  var document = domstream(fs.readFileSync(path, 'utf8'));

  var normalize = common.normalizeTree(document.tree);
  console.log();
  console.log();
  console.log(JSON.stringify(normalize));
  console.log(common.parsed);
  console.log();

  var filepath = path.slice(0, path.length - 5) + '.json';
  fs.writeFileSync(filepath, JSON.stringify(normalize));
}

parseFile(common.benchmark.small.html);
parseFile(common.benchmark.big.html);
