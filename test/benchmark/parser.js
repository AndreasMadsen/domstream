/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var common = require('../common.js');

var parse = require('../../lib/parse.js');

// read HTML content
var file = fs.readFileSync(common.benchmark.big.html, 'utf8');
var runs = 10000;

// run domstream tests with no-cache
console.log('test parser');
var i = runs,
    now = Date.now();

while (i--) {
  parse(file);
}

var avg = (Date.now() - now) / runs;

console.log('time:', avg);
