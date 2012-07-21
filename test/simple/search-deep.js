/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var chai = require('chai');
var common = require('../common.js');
var domstream = common.domstream;

describe('testing deep document search', function () {
  var assert = chai.assert;

  common.createTemplate(function (content) {
    var doc = domstream(content);

    var menuElem = doc.tree.childrens[0].childrens[1].childrens[1];
    var itemsElem = menuElem.childrens;

    describe('searching for menu', function () {
      var menu = doc.find().only().elem('menu').toValue();

      it('the result should match', function () {
        assert.ok(menu.elem === menuElem);
      });

      describe('when performing deep search on menu', function () {
        var items = menu.find().elem('li').toValue();

        it('only subchildrens should be found', function () {
          assert.lengthOf(items, 3);

          for (var i = 0, l = items.length; i < l; i++) {
            assert.ok(items[i].elem === itemsElem[i]);
          }
        });
      });
    });

  });
});
