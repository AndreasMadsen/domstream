/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var common = require('../common.js');

var copy = require('../../lib/copy.js');

// read HTML content
var file = JSON.parse(fs.readFileSync(common.benchmark.small.json, 'utf8'));
var runs = 100000;

// run domstream tests with no-cache
console.log('test parser');
var i = runs,
    now = Date.now();

while (i--) {
  copy(file);
}

var avg = (Date.now() - now) / runs;

console.log('time:', avg);
