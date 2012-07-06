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

var html = document.tree.childrens[0];
var menuElem = html.childrens[1].childrens[1];

var testsuite = vows.describe('testing deep document search');

testsuite.addBatch({

  'searching for menu': {
    topic: document.find().only().elem('menu').toValue(),

    'the result should match': function (menu) {
      assert.strictEqual(menu.elem, menuElem);
    },

    'when performing deep search on menu': {
      topic: function (menu) {
        return menu.find().elem('li').toValue();
      },

      'only subchildrens should be found': function (list) {
        assert.lengthOf(list, 3);
        list.forEach(function (node, index) {
          assert.strictEqual(node.elem, menuElem.childrens[index]);
        });
      }
    }
  }
});

testsuite.exportTo(module);
