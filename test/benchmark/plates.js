/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var path = require('path');
var common = require('../common.js');
var benchmark = require('./runner.js');

// read HTML content
var small = fs.readFileSync(common.benchmark.small.html, 'utf8');
var big = fs.readFileSync(common.benchmark.big.html, 'utf8');

// load module candiates
var Plates = require('plates');
var domstream = common.domstream;

var runs = 10000,
    cache = domstream(small);

// run plates tests
benchmark('small document: plates', runs, function () {
  Plates.bind(small, { main: 'new content' });
});

// run domstream tests with no-cache
benchmark('small document: domstream without cache', runs, function () {
  domstream(small).find().only().attr('id', 'main').toValue().setContent('new content');
});

// run domstream tests with cache
benchmark('small document: domstream with cache', runs, function () {
  cache.copy().find().only().attr('id', 'main').toValue().setContent('new content');
});

var runs = 10000,
    cache = domstream(big);

// run plates tests
benchmark('big document: plates', runs, function () {
  Plates.bind(big, { b: 'new content' });
});

// run domstream tests with no-cache
benchmark('big document: domstream without cache', runs, function () {
  domstream(big).find().only().attr('id', 'b').toValue().setContent('new content');
});

// run domstream tests with cache
benchmark('big document: domstream with cache', runs, function () {
  cache.copy().find().only().attr('id', 'b').toValue().setContent('new content');
});
