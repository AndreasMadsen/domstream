/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var util = require('util');
var stream = require('stream');

var Search = require('./search.js');
var copyDocument = require('./copy.js');
var parseDocument = require('./parse.js');

function Document(source) {
  stream.Readable.call(this);

  // stream properties
  this.containers = [];
  this.currentPos = 0;
  this.nextPos = 0;
  this.useStream = false;

  this.elemCache = [];
  this.nodeCache = [];

  this.liveParsing = false;

  // copy the raw content and the document tree
  if (source instanceof Document) {
    this.content = source.content;
    this.tree = copyDocument(source.tree);
  }
  // copy the raw content and parse the document content
  else {
    this.content = Buffer.isBuffer(source) ? source.toString() : source;
    this.tree = parseDocument(this.content);
  }
}
util.inherits(Document, stream.Readable);
module.exports = Document;

Document.prototype.copy = function () {
  return new Document(this);
};

Document.prototype.find = function () {
  return new Search(this, this.tree);
};

Document.prototype._read = function () {
  /* implemented by this.push */
};

Document.prototype._send = function (node) {
  // set chunked flag
  node.isChunked = true;

  // get the node index
  var containers = this.containers;
  var index = containers.indexOf(node);

  // calculate the next chunk position
  var next = 0,
      elem = node.elem,
      modify = elem.modify,
      pos = elem.pos;

  // remove node from containers list
  if (modify === false) {
    containers.splice(index, 1);
  }

  // do nothing if there are nodes before thisone
  if (index !== 0) return;

  // if .done was called
  // Send until next node, not the end of this one
  if (modify === false) {
    // if this is the last node, the position is the end
    if (containers.length === 0) {
      next = this.tree.pos.beforeend + 1;
    }

    // if other nodes exist, the position is the before the begining
    // of the next container.
    else {
      next = this.containers[0].elem.pos.beforebegin;
    }
  }

  // if .append was called, the position is before the endtag
  else {
    next = pos.beforeend;
  }

  // save next chunk position
  this.nextPos = next;

  this._push();
};

Document.prototype._push = function () {
  // Store the current position in a local variable and update the
  // current position to the next position.
  var current = this.currentPos,
      next = this.currentPos = this.nextPos;

  // If there is data to write push to the read able stream
  if (current !== next) {
    this.push(this.content.slice(current, next));
  }

  // If the just written end position is the end of the document send EOF
  if (next === this.tree.pos.beforeend + 1) {
    this.push(null);
  }
};

Document.prototype.live = function (bool) {
  this.liveParsing = bool;
  return this;
};

Document.prototype.container = function (nodes) {
  if (this.useStream) throw new Error('the .container method is already called');
  this.useStream = true;

  // do nothing if nodes was empty
  if (nodes.length === 0) return;

  var topLevel = [];
  var length = nodes.length;
  var i = length, j, node, pos, check;

  loop:while (i--) {
    node = nodes[i].elem;
    pos = {
      start: node.pos.beforebegin,
      end: node.singleton ? (node.pos.beforebegin + node.pos.afterbegin) : node.pos.beforeend
    };

    j = length;
    while (j--) {
      check = nodes[j].elem;

      // if node is inside another container (check), do not threat it as an container

      // the node can not be inside a singelton element
      if (check.singelton) continue;

      if (check.pos.beforebegin < pos.start && check.pos.beforeend > pos.end) {
        continue loop;
      }
    }

    topLevel.push(nodes[i]);
  }

  // do nothing if nodes was empty
  if (topLevel.length === 0) return;

  // sort top level nodes, so first tag is fist item
  topLevel = topLevel.sort(function sortfunction(a, b){
    return (a.elem.pos.beforebegin - b.elem.pos.beforebegin);
  });

  // Add containers
  this.containers = topLevel;

  // setup all contaners and there children,
  // so modification is allowed
  length = topLevel.length;
  i = length;
  while (i--) {
    node = topLevel[i];
    node.isContainer = true;
    node.elem.modify = true;
    node._childModify(true);
  }

  // send first chunk
  this.nextPos = topLevel[0].elem.pos.beforebegin;
  this._push();
};
