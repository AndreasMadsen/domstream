/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var chai = require('chai');
var common = require('../common.js');
var domstream = common.domstream;

describe('testing document stream - unordered', function () {
  var assert = chai.assert;

  common.createTemplate(function (content) {
    var doc = domstream(content);

    var input = doc.find().only().elem('input').toValue();
    var menu = doc.find().only().elem('menu').toValue();
    var li = doc.find().elem('li').toValue()[1];

    describe('when setting containers', function () {
      doc.container([input, menu, li]);

      it('the containers should be filtered and sorted', function () {
        assert.lengthOf(doc.containers, 2);
        assert.strictEqual(doc.containers[0], menu);
        assert.strictEqual(doc.containers[1], input);
      });
    });

    describe('when resumeing output', function () {
      it('the first data chunk should be returned', function () {
        var data = doc.read();

        assert.equal(data, doc.content.slice(0, menu.elem.pos.beforebegin));
        assert.notEqual(data[data.length - 1], '<');
      });
    });

    describe('when calling done on the last container', function () {
      it('no data can be read', function () {
        input.setAttr('value', 'foo').done();

        var data = doc.read();
        assert.equal(data, null);
      });
    });

    describe('when calling done on the remaining container', function () {
      it('the last data chunk should be returned', function () {
        menu.done();
        var data = doc.read();

        var content = doc.content.slice(
          menu.elem.pos.beforebegin,
          doc.tree.pos.beforeend + 1
        );

        assert.notEqual(data[data.length - 1], '<');
        assert.equal(data, content);
      });
    });
  });
});
