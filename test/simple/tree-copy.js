/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common.js');
var domstream = common.domstream;

var tree = domstream.Tree(common.content);

// create a new document
var document = tree.create();

console.log(require('util').inspect(document, false, Infinity, true));
