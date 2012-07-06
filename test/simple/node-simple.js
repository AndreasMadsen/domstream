/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var vows = require('vows');
var assert = require('assert');

var common = require('../common.js');
var domstream = common.domstream;

var content = fs.readFileSync(common.template, 'utf8');
var document = domstream(content);

var testsuite = vows.describe('testing node simple');

// test tagName
testsuite.addBatch({
  'when getting tagName form element': {
    topic: function () {
      return document.find().only().elem('html').toValue().tagName();
    },

    'expect value': function (result) {
      assert.equal(result, 'html');
    }
  },

  'when getting tagName from root': {
    topic: function () {
      return document.find().only().elem('html').toValue().getParent().tagName();
    },

    'expect throw': function (error) {
      assert.instanceOf(error, Error);
    }
  }
});

// test getContent
testsuite.addBatch({
  'when getting content form singleton element': {
    topic: function () {
      return document.find().only().elem('input').toValue().getContent();
    },

    'expect throw': function (error) {
      assert.instanceOf(error, Error);
    }
  },

  'when getting content normal element': {
    topic: function () {
      return document.find().only().elem('footer').toValue().getContent();
    },

    'expect value': function (result) {
      assert.equal(result, 'Bottom');
    }
  }
});

// test hasAttr and getAttr
testsuite.addBatch({
  'when checking for missing attribute': {
    topic: function () {
      return document.find().only().elem('html').toValue().hasAttr('missing');
    },

    'expect false': function (result) {
      assert.isFalse(result);
    }
  },

  'when checking for existing attribute': {
    topic: function () {
      return document.find().only().elem('html').toValue().hasAttr('lang');
    },

    'expect true': function (result) {
      assert.isTrue(result);
    }
  },

  'when reading missing attribute': {
    topic: function () {
      return document.find().only().elem('html').toValue().getAttr('missing');
    },

    'expect null': function (result) {
      assert.isNull(result);
    }
  },

  'when reading existing attribute': {
    topic: function () {
      return document.find().only().elem('html').toValue().getAttr('lang');
    },

    'expect value': function (result) {
      assert.equal(result, 'en');
    }
  }
});

// test getParrent
testsuite.addBatch({
  'when getting parent form element': {
    topic: function () {
      return document.find().only().elem('head').toValue().getParent();
    },

    'expect parent node': function (result) {
      assert.strictEqual(result.elem, document.find().only().elem('html').toValue().elem);
    }
  },

  'when getting parent from root': {
    topic: function () {
      return document.find().only().elem('html').toValue().getParent().getParent();
    },

    'expect throw': function (error) {
      assert.instanceOf(error, Error);
    }
  }
});

// test getChildren
testsuite.addBatch({
  'when getting children from singelton element': {
    topic: function () {
      return document.find().only().elem('input').toValue().getChildren();
    },

    'expect throw': function (error) {
      assert.instanceOf(error, Error);
    }
  },

  'when getting children from normal element': {
    topic: function () {
      return document.find().only().elem('html').toValue().getChildren();
    },

    'expect child list': function (list) {
      assert.lengthOf(list, 2);
      assert.strictEqual(list[0].elem, document.tree.childrens[0].childrens[0]);
      assert.strictEqual(list[1].elem, document.tree.childrens[0].childrens[1]);
    }
  }
});

// test isRoot
testsuite.addBatch({
  'when executeing isRoot on element': {
    topic: function () {
      return document.find().only().elem('html').toValue().isRoot();
    },

    'expect false': function (result) {
      assert.isFalse(result);
    }
  },

  'when executeing isRoot on root': {
    topic: function () {
      return document.find().only().elem('html').toValue().getParent().isRoot();
    },

    'expect true': function (result) {
      assert.isTrue(result);
    }
  }
});

// test isSingleton
testsuite.addBatch({
  'when executeing isSingleton on normal element': {
    topic: function () {
      return document.find().only().elem('div').toValue().isSingleton();
    },

    'expect false': function (result) {
      assert.isFalse(result);
    }
  },

 'when executeing isSingleton on singelton element': {
    topic: function () {
      return document.find().only().elem('input').toValue().isSingleton();
    },

    'expect true': function (result) {
      assert.isTrue(result);
    }
  }
});

// test isParentTo
testsuite.addBatch({
  'when executeing isParentTo on normal child element': {
    topic: function () {
      var html = document.find().only().elem('html').toValue();
      var body = document.find().only().elem('body').toValue();

      return html.isParentTo(body);
    },

    'expect true': function (result) {
      assert.isTrue(result);
    }
  },

  'when executeing isParentTo on normal none-child element': {
    topic: function () {
      var body = document.find().only().elem('body').toValue();
      var head = document.find().only().elem('head').toValue();

      return body.isParentTo(head);
    },

    'expect false': function (result) {
      assert.isFalse(result);
    }
  },

  'when executeing isParentTo on singelton element': {
    topic: function () {
      var html = document.find().only().elem('html').toValue();
      var input = document.find().only().elem('input').toValue();

      return input.isParentTo(html);
    },

    'expect false': function (result) {
      assert.isFalse(result);
    }
  }
});

// test equal
testsuite.addBatch({
  'when testing for equal on same element': {
    topic: function () {
      var html1 = document.find().only().elem('html').toValue();
      var html2 = document.find().only().elem('html').toValue();

      return html1.equal(html2);
    },

    'expect true': function (result) {
      assert.isTrue(result);
    }
  },

  'when testing for equal on diffrent element': {
    topic: function () {
      var body = document.find().only().elem('body').toValue();
      var head = document.find().only().elem('head').toValue();

      return body.equal(head);
    },

    'expect false': function (result) {
      assert.isFalse(result);
    }
  }
});

testsuite.exportTo(module);
