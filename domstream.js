/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var Tree = require('./lib/tree.js');
var Document = require('./lib/document.js');
var Search = require('./lib/search.js');
var Node = require('./lib/node.js');

exports = module.exports = function (content) {
  return new Tree(content);
};

exports.Document = Document;
exports.Search = Search;
exports.Tree = Tree;
exports.Node = Node;
