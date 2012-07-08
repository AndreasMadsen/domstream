/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var util = require('util');
var Stream = require('stream');

var Search = require('./search.js');
var copyDocument = require('./copy.js');
var parseDocument = require('./parse.js');

function Document(source) {

  this.elemCache = [];
  this.nodeCache = [];

  // copy the raw content and the document tree
  if (source instanceof Document) {
    this.content = source.content;
    this.tree = copyDocument(source.tree);
  }
  // copy the raw content and parse the document content
  else {
    this.content = source;
    this.tree = parseDocument(source);
  }
}
util.inherits(Document, Stream);
module.exports = Document;

Document.prototype.copy = function () {
  return new Document(this);
};

Document.prototype.find = function () {
  return new Search(this, this.tree);
};

Document.prototype.container = function (nodes) {

  // Note this is realNodes not tree elemenents
  nodes = Array.prototype.concat.apply([], nodes);
  nodes = nodes.sort(function sortfunction(a, b){
    return (a.elem.pos.beforestart - b.elem.pos.beforestart);
  });
  this.containers = nodes;

  // TODO: At this point the first set of chunks should be send
};
