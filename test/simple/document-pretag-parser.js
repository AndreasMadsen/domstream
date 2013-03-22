/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var chai = require('chai');
var common = require('../common.js');
var domstream = common.domstream;

describe('testing pretag parser', function () {
  var assert = chai.assert;

  describe('when parsing no pretag', function () {
    var content = '<doc></doc>';
    var doc = domstream(content);

    it('the content should be parsed as expected', function () {
      assert.equal(content.slice(doc.tree.pos.afterbegin, doc.tree.pos.beforeend + 1), '<doc></doc>');

      common.matchTree(doc.tree, {
        "isRoot": true,
        "pos": {
          "beforebegin": 0,
          "afterbegin": 0,
          "beforeend": 10,
          "afterend": 0
        },
        "childrens": [
          {
            "pos": {
              "beforebegin": 0,
              "afterbegin": 4,
              "beforeend": 5,
              "afterend": 5
            },
            "modify": false,
            "singleton": false,
            "tagname": "doc",
            "keys": [],
            "attr": {},
            "childrens": []
          }
        ]
      });
    });
  });

  describe('when parsing XML pretag', function () {
    var content = '<?xml version="1.0"?>\n<doc></doc>';
    var doc = domstream(content);

    it('the content should be parsed as expected', function () {
      assert.equal(content.slice(doc.tree.pos.afterbegin, doc.tree.pos.beforeend + 1), '<doc></doc>');

      common.matchTree(doc.tree, {
        "isRoot": true,
        "pos": {
          "beforebegin": 0,
          "afterbegin": 22,
          "beforeend": 32,
          "afterend": 0
        },
        "childrens": [
          {
            "pos": {
              "beforebegin": 22,
              "afterbegin": 4,
              "beforeend": 27,
              "afterend": 5
            },
            "modify": false,
            "singleton": false,
            "tagname": "doc",
            "keys": [],
            "attr": {},
            "childrens": []
          }
        ]
      });
    });
  });

  describe('when parsing HTML pretag', function () {
    var content = '<!DOCTYPE html>\n<doc></doc>';
    var doc = domstream(content);

    it('the content should be parsed as expected', function () {
      assert.equal(content.slice(doc.tree.pos.afterbegin, doc.tree.pos.beforeend + 1), '<doc></doc>');

      common.matchTree(doc.tree, {
        "isRoot": true,
        "pos": {
          "beforebegin": 0,
          "afterbegin": 16,
          "beforeend": 26,
          "afterend": 0
        },
        "childrens": [
          {
            "pos": {
              "beforebegin": 16,
              "afterbegin": 4,
              "beforeend": 21,
              "afterend": 5
            },
            "modify": false,
            "singleton": false,
            "tagname": "doc",
            "keys": [],
            "attr": {},
            "childrens": []
          }
        ]
      });
    });
  });

  describe('when parsing both XML and HTML pretag', function () {
    var content = '<?xml version="1.0"?>\n<!DOCTYPE html>\n<doc></doc>';
    var doc = domstream(content);

    it('the content should be parsed as expected', function () {
      assert.equal(content.slice(doc.tree.pos.afterbegin, doc.tree.pos.beforeend + 1), '<doc></doc>');

      common.matchTree(doc.tree, {
        "isRoot": true,
        "pos": {
          "beforebegin": 0,
          "afterbegin": 38,
          "beforeend": 48,
          "afterend": 0
        },
        "childrens": [
          {
            "pos": {
              "beforebegin": 38,
              "afterbegin": 4,
              "beforeend": 43,
              "afterend": 5
            },
            "modify": false,
            "singleton": false,
            "tagname": "doc",
            "keys": [],
            "attr": {},
            "childrens": []
          }
        ]
      });
    });
  });
});
