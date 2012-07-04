/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var Search;

function Node(document, elem) {
  this.document = document;
  this.elem = elem;

  this.isDone = false;
  this.isChunked = false;
}
module.exports = Node;

Node.prototype.insert = function (position, content) { //TODO
  if (this.isChunked) throw new Error('can not insert content after .append or .done');

  var elem = this.elem;
  if (elem.singleton) throw new Error('can not insert content to singleton element');

  return this;
};

Node.prototype.append = function (content) { //TODO
  if (this.isDone) throw new Error('can not append after .done');

  var elem = this.elem;
  if (elem.singleton) throw new Error('can not append to singleton element');

  this.isChunked = true;

  return this;
};

Node.prototype.trim = function () {
  if (this.isChunked) throw new Error('can not remove content after .append or .done');

  var elem = this.elem;
  if (elem.singleton) throw new Error('can not remove content from singleton element');

  // slice out content
  var before = elem.pos.beforebegin + elem.pos.afterbegin,
      after = elem.pos.beforeend,
      move = before - after + 1; // should be negative or zero

  // remove any node children
  elem.childrens = [];

  // remove content from document
  removeContent(this, before, after);

  // update all other tags (both star and end) there are to follow
  moveTagPointers(elem, move);

  return this;
};

Node.prototype.tagName = function () {
  return this.elem.tagname;
};

Node.prototype.getContent = function () {
  var elem = this.elem;
  if (elem.singleton) throw new Error('can not get content from singleton element');

  var pos = elem.pos;
  return this.document.content.slice(pos.afterbegin, pos.beforeend);
};

Node.prototype.setContent = function (content) {
  if (this.isChunked) throw new Error('can not set content after .append or .done');

  var elem = this.elem;
  if (elem.singleton) throw new Error('can not set content to singleton element');

  // slice out content
  var before = elem.pos.beforebegin + elem.pos.afterbegin,
      after = elem.pos.beforeend,
      length = content.length,
      move = before - after + length + 1; // should be negative

  // remove any node children
  elem.childrens = [];

  // remove content from document
  replaceContent(this, before, after, content);

  // update all other tags (both star and end) there are to follow
  moveTagPointers(elem, after, move);

  return this;
}

Node.prototype.getAttr = function (name) {
  var attr = this.elem.attr;
  if (attr.hasOwnProperty(name) === false) {
    return null;
  }

  return attr[name].value || '';
};

Node.prototype.setAttr = function (name, value) { //TODO
  if (this.isChunked) throw new Error('can not set attribute after .append or .done');

  return this;
};

Node.prototype.removeAttr = function (name) { //TODO
  if (this.isChunked) throw new Error('can not remove attribute after .append or .done');

  return this;
};

Node.prototype.equal = function (node) {
  return this.elem === node.elem;
};

var Search;
Node.prototype.find = function () {
  // To prevent require loops search needs to be lazy loaded,
  // but since it is already in cache that shouldn't be a problem
  if (!Search) Search = require('./search.js');

  return new Search(this.document, this.elem);
};

Node.prototype.done = function () { //TODO
  this.isDone = true;
  this.isChunked = true;

  return this;
};

function removeContent(node, from, to) {
  var doc = node.document;
  var text = doc.content;

  doc.content = text.slice(0, from + 1) + text.slice(to);
}

function replaceContent(node, from, to, content) {
  var doc = node.document;
  var text = doc.content;
  doc.content = text.slice(0, from + 1) + content + text.slice(to);
}

function moveTagPointers(elem, move) {
  // optimise for equal pointer
  if (move === 0) return;

  // move the end tag
  elem.pos.beforeend += move;

  // move childrens positions
  moveChildPointers(elem, move);

  // move all next siblings to this element
  moveParentSiblings(elem, move);
}

function moveChildPointers(elem, move) {
  if (elem.singleton) return;

  elem.childrens.forEach(function (child) {
    child.pos.beforebegin += move;
    child.pos.beforeend += move;

    moveChildPointers(child, move);
  });
}

function moveParentSiblings(elem, move) {
  if (elem.parent === undefined) return;

  var parent = elem.parent;
  var siblings = parent.childrens;

  // move end tag of this parent
  parent.pos.beforeend += move;

  // find and move all next siblings
  var nested = siblings.slice(siblings.indexOf(elem) + 1);
  nested.forEach(function (sibling) {
    moveChildPointers(sibling, move);
  });

  // move next parent
  moveParentSiblings(parent, move);
}
