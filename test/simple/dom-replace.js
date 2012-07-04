/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common.js');
var domstream = common.domstream;

var tree = domstream(common.content);

// create a new document
var document = tree.create();

var menu = document.find().only().elem('menu').toValue();

menu.trim();

console.log(document.content);
//console.log(require('util').inspect(document, false, 20, true));
