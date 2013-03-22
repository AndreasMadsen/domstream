/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var endpoint = require('endpoint');
var chai = require('chai');
var common = require('../common.js');
var domstream = common.domstream;

describe('testing document stream', function () {
  var assert = chai.assert;

  common.createTemplate(function (content) {
    var doc = domstream(content);

    var input = doc.find().only().elem('input').toValue();
    var menu = doc.find().only().elem('menu').toValue();
    var li = doc.find().elem('li').toValue()[1];

    describe('when setting containers', function () {
      doc.container([input, menu, li]),

      it('the containers should be filtered and sorted', function () {
        assert.lengthOf(doc.containers, 2);
        assert.strictEqual(doc.containers[0], menu);
        assert.strictEqual(doc.containers[1], input);
      });
    });

    describe('when setting containers twice', expectError(function () {
      doc.container([input, menu, li]);
    }));

    describe('when reading data', function () {
      it('the first data chunk should be returned', function () {
        var data = doc.read().toString();
        assert.equal(data, doc.content.slice(0, menu.elem.pos.beforebegin));
        assert.notEqual(data[data.length - 1], '<');
      });
    });

    // test throw on nodes there are outside an container
    var head = doc.find().only().elem('head').toValue();
    testOfline(head, 'outside an container', true);

    // test appending content on subcontainer
    describe('when appending content to subcontainer', function () {
      it('no data chunk should emit', function () {
        li.append('new content');
        assert.equal(doc.read(), null);
      });

      describe('after appending content to subcontaner', function () {
        li.setAttr('foo', 'value');

        var value = li.getAttr('foo');

        it('modification should stil be allowed', function () {
          assert.equal(value, 'value');
        });
      });
    });

    // test appending content on container
    describe('when appending content to container', function () {
      it('a data chunks should emit', function () {
        menu.append('<li>new item</li>');
        var data = doc.read();
        var content = doc.content.slice(menu.elem.pos.beforebegin, menu.elem.pos.beforeend);
        assert.equal(data, content);
        assert.notEqual(data[data.length - 1], '<');
      });
    });

    testOfline(menu, 'on a chunked container', false);

    describe('when appending content o a chunked container', function () {
      it('a data chunks should emit', function () {
        menu.append('<li>new item</li>');
        var data = doc.read();
        assert.equal(data, '<li>new item</li>');
        assert.notEqual(data[data.length - 1], '<');
      });
    });

    // test done on an container
    describe('when calling done a container', function () {
      it('a data chunks should emit', function () {
        menu.done();
        var data = doc.read();

        var content = doc.content.slice(
          menu.elem.pos.beforeend,
          input.elem.pos.beforebegin
        );
        assert.notEqual(data[data.length - 1], '<');
        assert.equal(data, content);
      });
    });

    testOfline(menu, 'on a done container', true);

    // test modifty on a singleton container
    describe('when modifying attributes on a singleton container', function () {
      input.setAttr('foo', 'value');
      return input.getAttr('foo');

      it('it should be set', function (value) {
        assert.equal(value, 'value');
      });
    });

    describe('when calling done on on a singleton container', function () {

      it('a data chunk should emit', function () {
        input.done();
        var data = doc.read();

        var content = doc.content.slice(
            input.elem.pos.beforebegin,
            doc.tree.pos.beforeend + 1
          );

        assert.notEqual(data[data.length - 1], '<');
        assert.equal(data, content);
      });
    });
  });

  function expectError(fn) {
    return function () {
      it('should throw an error', function () {
        var error = null;
        try {
          fn();
        } catch (e) {
          error = e;
        } finally {
            assert.instanceOf(error, Error);
        }
      });
    };
  }

  // set that everything there should throw, do throws
  function testOfline(node, text, testAppend) {
    describe(text, function () {

      describe('when trying to set content', expectError(function () {
        node.setContent('fail');
      }));

      describe('when trying to remove content', expectError(function () {
        node.trim();
      }));

      if (testAppend) {
        describe('when trying to append content', expectError(function () {
          node.append('fail');
        }));
      }

      describe('when trying to insert content', expectError(function () {
        node.insert('afterend', 'fail');
      }));

      describe('when trying to remove attribute', expectError(function () {
        node.removeAttr('fail');
      }));

      describe('when trying to set attribute', expectError(function () {
        node.setAttr('fail');
      }));

    });
  }
});
