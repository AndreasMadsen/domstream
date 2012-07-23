/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var Node = require('./node.js');

function Search(document, tree) {
  this.document = document;
  this.tree = tree;

  this.searchList = [];
  this.nodeList = [];

  this.filled = false;
  this.onlySearch = false;
  this.onlyFlag = false;
}
module.exports = Search;

Search.prototype._match = function (fn) {
  // throw if more search requests are made
  if (this.onlySearch) {
    throw new Error('can not add search criterias after .toArray or .toValue was called with .only');
  }

  this.searchList.push(fn);
  return this;
};

Search.prototype.elem = function (tagname) {
  this._match(function (elem) {
    return elem.tagname === tagname;
  });
  return this;
};

Search.prototype.attr = function (name, match) {
  if (typeof name !== 'string') {
    throw new Error('Could not understand arguments');
  } else if (match === undefined) {
    this._match(function (elem) {
      return elem.keys.indexOf(name) !== -1;
    });
  } else if (typeof match === 'string') {
    this._match(function (elem) {
      return elem.keys.indexOf(name) !== -1 && elem.attr[name].value === match;
    });
  } else if (match instanceof RegExp) {
    this._match(function (elem) {
      return elem.keys.indexOf(name) !== -1 && match.test(elem.attr[name].value);
    });
  } else {
    throw new Error('Could not understand arguments');
  }
  return this;
};

Search.prototype.only = function () {
  this.onlyFlag = true;
  return this;
};

Search.prototype.toArray = function () {
  var self = this;

  if (this.searchList.length !== 0) {
    this.nodeList = this._performSearch();
    this.filled = true;
    this.searchList = [];

    // throw if more search requests are made
    if (this.onlyFlag) {
      this.onlySearch = true;
    }
  }

  // convert result to real nodes
  var realNodes = this.onlyFlag ? this.nodeList.slice(0, 1) : this.nodeList.slice(0);

  return realNodes.map(function (elem) {
    return Node.create(self.document, elem);
  });
};

Search.prototype.toValue = function () {
  var result = this.toArray();

  if (result.length === 0) {
    return false;
  } else if (this.onlyFlag) {
    return result.shift();
  } else {
    return result;
  }
};

Search.prototype._performSearch = function () {
  var result = [], elem;

  // don't do a tree search
  if (this.filled) {
    var nodeList = this.nodeList;
    var i = 0, l = nodeList.length;

    // search only until first element
    if (this.onlyFlag) {
      for (; i < l; i++) {
        elem = nodeList[i];
        if (this._doPass(elem)) {
          result.push(elem);
          break;
        }
      }

      return result;
    }

    // search all elements
    for (; i < l; i++) {
      elem = nodeList[i];
      if (this._doPass(elem)) {
        result.push(elem);
      }
    }

    return result;
  }

  // deep search the tree
  if (this.onlyFlag) {
    elem = this._searchOneChild(this.tree);
    if (elem) result.push(elem);
    return result;
  }

  this._searchChildrens(this.tree, result);
  return result;
};

Search.prototype._searchOneChild = function (elem) {
  // don't search if there is no children
  if (elem.singleton) return;

  // we want an ordered list
  var childrens = elem.childrens,
      i = 0, l = childrens.length,
      child, result;

  for (; i < l; i++) {
    child = childrens[i];
    if (this._doPass(child)) {
      return child;
    }

    result = this._searchOneChild(child);
    if (result) return result;
  }

  return null;
};

Search.prototype._searchChildrens = function (elem, result) {
  var self = this;

  // don't search if there is no children
  if (elem.singleton) return;

  // we want an ordered list
  elem.childrens.forEach(function (child) {
    if (self._doPass(child)) {
      result.push( child );
    }

    self._searchChildrens(child, result);
  });
};

Search.prototype._doPass = function (elem) {
  var searchList = this.searchList;
  var i = 0, l = searchList.length;

  // search in normal order, since its likly that will be the optimised order
  // example: .elem('tag').attr('value', /hallo/) would be a shame to do backwards
  for (; i < l; i++) {
    if (searchList[i](elem) === false) {
      return false;
    }
  }

  return true;
};
