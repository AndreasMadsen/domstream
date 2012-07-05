/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var common = require('../common.js');
var domstream = common.domstream;

var document = domstream(fs.readFileSync(common.template, 'utf8'));
var tree = document.tree;

var match = JSON.parse(fs.readFileSync(common.parsed, 'utf8'));

common.treeMatch(tree, match);
