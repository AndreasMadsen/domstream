/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var Document = require('./lib/document.js');
var Search = require('./lib/search.js');
var Node = require('./lib/node.js');
var parseDocument = require('./lib/parse.js');

exports = module.exports = function (content) {
  return new Document(content);
};

exports.Document = Document;
exports.Search = Search;
exports.Node = Node;
exports.NO_ENDING_TAG = parseDocument.NO_ENDING_TAG;
