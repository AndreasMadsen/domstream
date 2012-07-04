/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common.js');
var domstream = common.domstream;

var tree = domstream.Tree(common.content);
console.log(require('util').inspect(tree, false, Infinity, true));
