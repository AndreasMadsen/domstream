/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var os = require('os');
var fs = require('fs');
var common = require('../common.js');

// load module candiates
var Plates = require('plates');
var Mustache = require('mustache');
var domstream = common.domstream;

function benchmark(runs, fn) {
  var i = runs,
      now = Date.now();
  while(i--) {
    fn();
  }

  // calculate results
  var ms = Date.now() - now;
  return (ms / runs);
}

function run(size) {
  console.log();

  // should not be included in benchmark
  var runs = 1000000,
      result = {},
      content = fs.readFileSync(common.benchmark[size].html, 'utf8'),
      cache = domstream(content);

  // run domstream tests with cache
  result['domstream - cache'] = benchmark(runs, function () {
    cache.copy().find().only().attr('id', 'main');
  });

  console.log('completed: ' + size + ' -> domstream - cache');
  console.log();
  return result;
}

var table = {
  small: run('small')
};

// output markdown table

console.log('Executed on cpu: `' + os.cpus()[0].model + '` and node: `' + process.version + '`.');
console.log();
console.log('| Case                        | ms / run - less is better |');
console.log('|----------------------------:|:--------------------------|');

var caseLength = 29,
    speedLength = 27;

Object.keys(table).forEach(function (size) {
  var headder = '**a ' + size + ' document** (' + fs.readFileSync(common.benchmark[size].html).length + ' B)';

  console.log('| ' + headder + new Array((caseLength + speedLength) - headder.length).join(' ') + ' |');

  Object.keys(table[size]).sort(function (a, b) { return table[size][b] - table[size][a]; }).forEach(function (text) {
    console.log(
      '| ' + text + new Array(caseLength - text.length).join(' ') +
      '| ' + table[size][text] + new Array(speedLength - (table[size][text]).toString().length).join(' ') +
      '|');
  });

});

console.log();
