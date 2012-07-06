/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var dirname = path.dirname(module.filename);

exports.domstream = require(path.resolve(dirname, '../domstream.js'));

exports.fixture = path.resolve(dirname, './fixture/');
exports.template = path.resolve(exports.fixture, 'template.html');
exports.parsed = path.resolve(exports.fixturername, 'parsed.json');

// filter out any parent, to prevent a too deep search when doing deep match
function removeParent(from) {
  var to = {};

  Object.keys(from).forEach(function (key) {
    if (key === 'parent' || key === 'childrens') return;
    to[key] = from[key];
  });

  if (!from.singleton) {
    to.childrens = [];
    from.childrens.forEach(function (child) {
      to.childrens.push( removeParent(child) );
    });
  }

  return to;
}
exports.removeParent = removeParent;

// Check that two dom trees match
function matchTree(actual, expected) {
  assert.notEqual(actual, expected);

  // check that none circular properties match
  assert.deepEqual(removeParent(actual), removeParent(expected));

  // check parentTree
  checkParrentTree(actual);
}
exports.matchTree = matchTree;

function checkParrentTree(tree) {
  if (tree.singleton) return;

  // go through all childrens and check that there parent match this element
  tree.childrens.forEach(function (child) {
    assert.notEqual(child.parent, undefined);
    assert.strictEqual(child.parent, tree);

    checkParrentTree(child);
  });
}
exports.checkParrentTree = checkParrentTree;
