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

  // allow node object to be reused
  document.elemCache.push(elem);
  document.nodeCache.push(this);
}

module.exports = Node;

// this function will check the cache and
// return a new Node object if it don't exist
// in cache, or return the cached Node object.
Node.create = function (document, elem) {
  // check cache
  var index = document.elemCache.indexOf(elem);

  // not cached, create new
  if (index === -1) {
    return new Node(document, elem);
  }

  // return cache
  return document.nodeCache[index];
};

Node.prototype.tagName = function () {
  var elem = this.elem;
  if (elem.isRoot) throw new Error('root has no tagname');

  return elem.tagname;
};

Node.prototype.isSingleton = function () {
  return !!this.elem.singleton;
};

Node.prototype.isRoot = function () {
  return !!this.elem.isRoot;
};

Node.prototype.equal = function (node) {
  return this === node;
};

Node.prototype.getParent = function () {
  var elem = this.elem;
  if (elem.isRoot) throw new Error('root has no parent');

  return Node.create(this.document, elem.parent);
};

Node.prototype.getChildren = function () {
  var elem = this.elem;
  if (elem.isSingleton) throw new Error('singelton element has no children');

  var doc = this.document;
  return elem.childrens.map(function (child) {
    return Node.create(doc, child);
  });
};

Node.prototype.isParentTo = function (node) {
  var parent = node.elem.parent;

  return !!parent && this.elem === parent;
};

Node.prototype.insert = function (where, content) {
  if (this.isChunked) throw new Error('can not insert content after .append or .done');

  if (insertAdjacentMethods.hasOwnProperty(where) === false) {
    throw new Error('did not understand first argument');
  }

  insertAdjacent(this, where, content);

  return this;
};

Node.prototype.append = function (content) {
  if (this.isDone) throw new Error('can not append after .done');

  if (this.elem.singleton) throw new Error('can not append to singleton element');

  this.isChunked = true;

  insertAdjacent(this, 'beforeend', content);

  return this;
};

Node.prototype.trim = function () {
  if (this.isChunked) throw new Error('can not remove content after .append or .done');

  var elem = this.elem;
  if (elem.singleton) throw new Error('can not remove content from singleton element');

  // get positions and size
  var before = elem.pos.beforebegin + elem.pos.afterbegin + 1,
      after = elem.pos.beforeend,
      move = before - after; // should be negative or zero

  // remove any node children
  elem.childrens = [];

  // remove content from document
  removeContent(this, before, after);

  // update all other tags (both start and end) there are to follow
  moveTagPointers(elem, move);

  return this;
};

Node.prototype.getContent = function () {
  var elem = this.elem;
  if (elem.singleton) throw new Error('can not get content from singleton element');

  var pos = elem.pos,
      before = pos.beforebegin + pos.afterbegin + 1,
      after = pos.beforeend;
  return this.document.content.slice(before, after);
};

Node.prototype.setContent = function (content) {
  if (this.isChunked) throw new Error('can not set content after .append or .done');

  var elem = this.elem;
  if (elem.singleton) throw new Error('can not set content to singleton element');

  // get postions and sizes
  var before = elem.pos.beforebegin + elem.pos.afterbegin + 1,
      after = elem.pos.beforeend,
      length = content.length,
      move = before - after + length; // should be negative

  // remove any node children
  elem.childrens = [];

  // remove content from document
  replaceContent(this, before, after, content);

  // update all other tags (both start and end) there are to follow
  moveTagPointers(elem, move);

  return this;
};

Node.prototype.getAttr = function (name) {
  if (this.elem.keys.indexOf(name) === -1) {
    return null;
  }

  return this.elem.attr[name].value || '';
};

Node.prototype.hasAttr = function (name) {
  return this.elem.keys.indexOf(name) !== -1;
};

Node.prototype.setAttr = function (name, value) {
  if (this.isChunked) throw new Error('can not set attribute after .append or .done');

  var elem = this.elem,
      keys = elem.keys,
      attr, before, after, start, move;

  var content = name + '="' + value + '"',
      length = content.length;

  // attribute do not exist: do nothing
  if (this.hasAttr(name)) {
    attr = elem.attr[name];

    // get postions and sizes
    before = elem.pos.beforebegin + attr.start;
    after = before + attr.end + 1;
    move = -attr.end - 1 + length;

    // remove element from keys array and attr
    var index = keys.indexOf(name);

    // replace content from document
    replaceContent(this, before, after, content);

    // move following attibutes
    attr.value = value;

    if (move !== 0) {
      attr.end = length - 1;
      moveAttibutePointers(elem, index + 1, move);

      // update all other tags (both start and end) there are to follow
      elem.pos.afterbegin += move;
      moveTagPointers(elem, move);
    }

    return this;
  }

  // get last attribute
  attr = elem.attr[keys[keys.length - 1]];

  start = attr.start + attr.end;
  after = before = elem.pos.beforebegin + start + 1;
  move = length + 1;

  // create attribute
  keys.push(name);
  attr = elem.attr[name] = {
    start: start + 2,
    name: name,
    end: length - 1,
    value: value
  };

  // replace content from document
  replaceContent(this, before, after, " " + content);

  // update all other tags (both start and end) there are to follow
  elem.pos.afterbegin += move;
  moveTagPointers(elem, move);

  return this;
};

Node.prototype.removeAttr = function (name) {
  if (this.isChunked) throw new Error('can not remove attribute after .append or .done');

  // attribute do not exist: do nothing
  if (this.hasAttr(name) === false) {
    return this;
  }

  var elem = this.elem,
      keys = elem.keys,
      attr = elem.attr[name];

  // get postions and sizes
  var before = elem.pos.beforebegin + attr.start,
      after = before + attr.end,
      move = -attr.end - 1; // should be negative

  // remove element from keys array and attr
  var index = keys.indexOf(name);
  keys.splice(index, 1);
  delete elem.attr[name];

  // remove content from document
  removeContent(this, before, after + 1);

  // move following attibutes
  moveAttibutePointers(elem, index, move);

  // update all other tags (both start and end) there are to follow
  elem.pos.afterbegin += move;
  moveTagPointers(elem, move);

  return this;
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


function insertAdjacent(node, where, content) {

  // skip if content is empty
  var move = content.length;
  if (move === 0) return;
  var elem = node.elem;

  // insert content and move the parts all parts except
  // "moveParentSiblings" since that will always be needed
  insertAdjacentMethods[where](node, elem, content, move);

  // move all next siblings to this element
  moveParentSiblings(elem, move);
}

var insertAdjacentMethods = {
  'beforebegin': function (node, elem, content, move) {
    // get positions and size
    var insert = elem.pos.beforebegin;

    // remove content from document
    replaceContent(node, insert, insert, content);

    // update all other tags (both start and end) there are to follow
    // move the end tag
    elem.pos.beforebegin += move;
    elem.pos.beforeend += move;
    moveChildPointers(elem, move);
  },

  'afterbegin': function (node, elem, content, move) {
    if (elem.singleton) throw new Error('can not insert content intro singleton element');

    // get positions and size
    var insert = elem.pos.beforebegin + elem.pos.afterbegin + 1;

    // remove content from document
    replaceContent(node, insert, insert, content);

    // update all other tags (both start and end) there are to follow
    // move the end tag
    elem.pos.beforeend += move;
    moveChildPointers(elem, move);
  },

  'beforeend': function (node, elem, content, move) {
    if (elem.singleton) throw new Error('can not insert content intro singleton element');

    // get positions and size
    var insert = elem.pos.beforeend;

    // remove content from document
    replaceContent(node, insert, insert, content);

    // Update the end tag
    elem.pos.beforeend += move;
  },

  'afterend': function (node, elem, content) {
    // get positions and size
    var insert = elem.pos.beforeend + elem.pos.afterend + 1;

    // remove content from document
    replaceContent(node, insert, insert, content);
  }
};

function removeContent(node, from, to) {
  var doc = node.document;
  var text = doc.content;

  doc.content = text.slice(0, from) + text.slice(to);
}

function replaceContent(node, from, to, content) {
  var doc = node.document;
  var text = doc.content;
  doc.content = text.slice(0, from) + content + text.slice(to);
}

function moveAttibutePointers(elem, index, move) {
  var attr = elem.attr,
      nested = elem.keys.slice(index),
      i = nested.length;

  while (i--) {
    attr[nested[i]].start += move;
  }
}

function moveTagPointers(elem, move) {
  // optimise for equal pointer
  if (move === 0) return;

  // move the end tag
  elem.pos.beforeend += move;


  // move childrens positions
  if (!elem.singleton) {
    moveChildPointers(elem, move);
  }

  // move all next siblings to this element
  moveParentSiblings(elem, move);
}

function moveChildPointers(elem, move) {
  elem.childrens.forEach(function (child) {
    child.pos.beforebegin += move;

    // deep move childrens
    if (!child.singleton) {
      child.pos.beforeend += move;

      moveChildPointers(child, move);
    }
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
    sibling.pos.beforebegin += move;

    // deep move childrens
    if (!sibling.singleton) {
      sibling.pos.beforeend += move;

      moveChildPointers(sibling, move);
    }
  });

  // move next parent
  moveParentSiblings(parent, move);
}
