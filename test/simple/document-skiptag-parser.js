/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var chai = require('chai');
var common = require('../common.js');
var domstream = common.domstream;

describe('testing pretag parser', function () {
  var assert = chai.assert;

  describe('when parsing HTML comments', function () {
    var content = '<doc><!-- <b></b> --></doc>';
    var doc = domstream(content);

    it('the content should be parsed as expected', function () {
      assert.equal(content.slice(
        doc.tree.childrens[0].pos.afterbegin + 1,
        doc.tree.childrens[0].pos.beforeend
      ), '<!-- <b></b> -->');

      common.matchTree(doc.tree, {
        "isRoot": true,
        "pos": {
          "beforebegin": 0,
          "afterbegin": 0,
          "beforeend": 26,
          "afterend": 0
        },
        "childrens": [
          {
            "pos": {
              "beforebegin": 0,
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

  describe('when parsing XML CDATA', function () {
    var content = '<doc><![CDATA[ <b></b> ]]></doc>';
    var doc = domstream(content);

    it('the content should be parsed as expected', function () {
      assert.equal(content.slice(
        doc.tree.childrens[0].pos.afterbegin + 1,
        doc.tree.childrens[0].pos.beforeend
      ), '<![CDATA[ <b></b> ]]>');

      common.matchTree(doc.tree, {
        "isRoot": true,
        "pos": {
          "beforebegin": 0,
          "afterbegin": 0,
          "beforeend": 31,
          "afterend": 0
        },
        "childrens": [
          {
            "pos": {
              "beforebegin": 0,
              "afterbegin": 4,
              "beforeend": 26,
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

  describe('when parsing something wired', function () {
    var content = '<doc><!wired> </!wired></doc>';
    var doc = domstream(content);

    it('the content should be parsed as expected', function () {
      assert.equal(content.slice(
        doc.tree.childrens[0].pos.afterbegin + 1,
        doc.tree.childrens[0].pos.beforeend
      ), '<!wired> </!wired>');

      common.matchTree(doc.tree, {
        "isRoot": true,
        "pos": {
          "beforebegin": 0,
          "afterbegin": 0,
          "beforeend": 28,
          "afterend": 0
        },
        "childrens": [
          {
            "pos": {
              "beforebegin": 0,
              "afterbegin": 4,
              "beforeend": 23,
              "afterend": 5
            },
            "modify": false,
            "singleton": false,
            "tagname": "doc",
            "keys": [],
            "attr": {},
            "childrens": [
              {
                "pos": {
                  "beforebegin": 5,
                  "afterbegin": 7,
                  "beforeend": 14,
                  "afterend": 8
                },
                "modify": false,
                "singleton": false,
                "tagname": "!wired",
                "keys": [],
                "attr": {},
                "childrens": []
              }
            ]
          }
        ]
      });
    });
  });
});
