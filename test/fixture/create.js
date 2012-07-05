/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var common = require('../common.js');
var domstream = common.domstream;

var document = domstream(fs.readFileSync(common.template, 'utf8'));
var tree = document.tree;

var parrentFree = common.removeParent(document.tree);
console.log(JSON.stringify(parrentFree));

console.log(common.parsed);

fs.writeFileSync(common.parsed, JSON.stringify(parrentFree));

console.log('write file');