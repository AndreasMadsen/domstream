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
};

Node.prototype.append = function (content) { //TODO
  if (this.isDone) throw new Error('can not append after .done');
  this.isChunked = true;
};

Node.prototype.trim = function () { //TODO
  if (this.isChunked) throw new Error('can not remove content after .append or .done');
};

Node.prototype.tagName = function () {
  return this.elem.tagname;
};

Node.prototype.getContent = function () {
  var pos = this.elem.pos;
  return this.document.content.slice(pos.afterbegin, pos.beforeend);
};

Node.prototype.setContent = function () { //TODO
  if (this.isChunked) throw new Error('can not set content after .append or .done');
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

};

Node.prototype.removeAttr = function (name) { //TODO
  if (this.isChunked) throw new Error('can not remove attribute after .append or .done');
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
};
