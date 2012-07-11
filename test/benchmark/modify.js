/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

if (process.argv[2] !== 'text' && process.argv[2] !== 'html') return;

var fs = require('fs');
var common = require('../common.js');
var domstream = common.domstream;

// read HTML content
var file = fs.readFileSync(common.benchmark.small.html, 'utf8');
var base = domstream(file);
var runs = 50000;

var bool = process.argv[2] === 'html';

// prepear documents
var cache = [];
var i = runs;
while (i--) {
  cache.push( base.copy().live(bool).find().only().attr('id', 'main').toValue() );
}

console.log();

if (process.argv[2] === 'text') {
  console.log('=== adding text only ===');
} else {
  console.log('=== adding html text ===');
}

var i = runs,
    now = Date.now();
while (i--) {
  cache[i].setContent('<a href="/foo/">Hallo world</a>');
}

var avg = (Date.now() - now) / runs;
console.log('speed: ' + avg + ' / run');

console.log();
