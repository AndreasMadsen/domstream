/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common.js');
var domstream = common.domstream;

var tree = domstream(common.content);

// create a new document
var document = tree.create();

var menu = document.find().only().elem('div').toValue();

menu.append('content text');

console.log(require('util').inspect(document, false, 20, true));

///console.log(document.content.slice(footer.elem.pos.beforebegin, footer.elem.pos.beforeend + footer.elem.pos.afterend));

//console.log(document.content);
