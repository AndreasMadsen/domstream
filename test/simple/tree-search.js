/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common.js');
var domstream = common.domstream;

var tree = domstream.Tree(common.content);

// create a new document
var document = tree.create();

var menu = document.find().only().elem('menu').toValue();
var items = menu.find().attr('data-match', '1').toValue();

items.forEach(function (item) {
  console.log(item.tagName());
});
