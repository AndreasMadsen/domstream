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
  // copy the raw content and the document tree
  if (source instanceof Document) {
    this.content = source.content;
    this.root = copyDocument(source.root);
  }
  // copy the raw content and parse the document content
  else {
    this.content = source;
    this.root = parseDocument(this);
  }
}
util.inherits(Document, Stream);
module.exports = Document;

Document.prototype.create = function () {
  return new Document(this);
};

Document.prototype.find = function () {
  return new Search(this, this.root);
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
