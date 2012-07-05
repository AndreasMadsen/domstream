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
  this.first = false;
}
module.exports = Search;

Search.prototype.search = function (fn) {
  this.searchList.push(fn);
  return this;
};

Search.prototype.elem = function (tagname) {
  this.searchList.push(function (elem) {
    return elem.tagname === tagname;
  });
  return this;
};

Search.prototype.attr = function (name, match) {
  if (typeof name !== 'string') {
    throw new Error('Could not understand arguments');
  } else if (match === undefined) {
    this.searchList.push(function (elem) {
      return elem.keys.indexOf(name) !== -1;
    });
  } else if (typeof match === 'string') {
    this.searchList.push(function (elem) {
      return elem.keys.indexOf(name) !== -1 && elem.attr[name].value === match;
    });
  } else if (match instanceof RegExp) {
    this.searchList.push(function (elem) {
      return elem.keys.indexOf(name) !== -1 && match.test(elem.attr[name].value);
    });
  } else {
    throw new Error('Could not understand arguments');
  }
  return this;
};

Search.prototype.only = function () {
  if (this.filled) {
    throw new Error('can not call .only() after toArray or toValue is called');
  }

  this.first = true;
  return this;
};

Search.prototype.toArray = function () {
  var self = this;

  this.nodeList = performSearch(this);
  this.searchList = [];

  // convert result to real nodes
  var realNodes = this.first ? this.nodeList.slice(0, 1) : this.nodeList.slice(0);

  return realNodes.map(function (elem) {
    return new Node(self.document, elem);
  });
};

Search.prototype.toValue = function () {
  var result = this.toArray();

  if (result.length === 0) {
    return false;
  } else if (this.first) {
    return result.shift();
  } else {
    return result;
  }
};

function performSearch(search) {
  var result = [];

  // don't do a tree search
  if (search.filled) {
    var nodeList = search.nodeList;
    var i = 0, l = nodeList.length;
    var elem;

    // search only until first element
    if (search.first) {
      for (; i < l; i++) {
        elem = nodeList[i];
        if (doPass(search, elem)) {
          result.push(elem);
          break;
        }
      }

      return result;
    }

    // search all elements
    for (; i < l; i++) {
      elem = nodeList[i];
      if (doPass(search, elem)) {
        result.push(elem);
      }
    }

    return result;
  }

  // deep search the tree
  if (search.first) {
    var elem = searchOneChild(search, search.tree);
    if (elem) result.push(elem);
    return result;
  }

  searchChildrens(search, search.tree, result);
  return result;
}

function searchOneChild(search, elem) {
  // don't search if there is no children
  if (elem.singleton) return;

  // we want an ordered list
  var childrens = elem.childrens,
      i = 0, l = childrens.length,
      child, result;

  for (; i < l; i++) {
    child = childrens[i];
    if (doPass(search, child)) {
      return child;
    }

    result = searchOneChild(search, child);
    if (result) return result;
  }

  return null;
}

function searchChildrens(search, elem, result) {
  // don't search if there is no children
  if (elem.singleton) return;

  // we want an ordered list
  elem.childrens.forEach(function (child) {
    if (doPass(search, child)) {
      result.push( child );
    }

    searchChildrens(search, child, result);
  });
}

function doPass(search, elem) {
  var searchList = search.searchList;
  var i = 0, l = searchList.length;

  // search in normal order, since its likly that will be the optimised order
  // example: .elem('tag').attr('value', /hallo/) would be a shame to do backwards
  for (; i < l; i++) {
    if (searchList[i](elem) === false) {
      return false;
    }
  }

  return true;
}
