/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var flower = require('flower');
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

    describe('when resumeing output', function () {
      var data; before(function (done) {
        doc.once('data', function (chunk) {
          data = chunk;
          done();
        });
        doc.resume();
      });

      it('the first data chunk should emit', function () {
        assert.equal(data, doc.content.slice(0, menu.elem.pos.beforebegin));
        assert.notEqual(data[data.length - 1], '<');
      });
    });

    // test throw on nodes there are outside an container
    var head = doc.find().only().elem('head').toValue();
    testOfline(head, 'outside an container', true);

    // test appending content on subcontainer
    describe('when appending content to subcontainer', function () {
      function ondata() {
        throw new Error('data event emitted');
      }

      before(function () {
        doc.once('data', ondata);
        li.append('new content');
      });

      it('no data chunk should emit', function (done) {
        setTimeout(function() {
          doc.removeListener('data', ondata);
          done();
        }, 200);
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
      var data; before(function (done) {
        doc.once('data', function (chunk) {
          data = chunk;
          done();
        });
        menu.append('<li>new item</li>');
      });

      it('a data chunks should emit', function () {
        var content = doc.content.slice(menu.elem.pos.beforebegin, menu.elem.pos.beforeend);
        assert.notEqual(data[data.length - 1], '<');
        assert.equal(data, content);
      });
    });

    testOfline(menu, 'on a chunked container', false);

    describe('when appending content o a chunked container', function () {
      var data; before(function (done) {
        doc.once('data', function (chunk) {
          data = chunk;
          done();
        });
        menu.append('<li>new item</li>');
      });


      it('a data chunks should emit', function () {
        assert.notEqual(data[data.length - 1], '<');
        assert.equal(data, '<li>new item</li>');
      });
    });


    // test done on an container
    describe('when calling done a container', function () {
      var data; before(function (done) {
        doc.once('data', function (chunk) {
          data = chunk;
          done();
        });
        menu.done();
      });

      it('a data chunks should emit', function () {
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
      var data; before(function (done) {
        doc.once('data', function (chunk) {
          data = chunk;
          done();
        });
        input.done();
      });

      it('a data chunk should emit', function () {
        var content = doc.content.slice(
            input.elem.pos.beforebegin,
            doc.tree.pos.beforeend + 1
          );

        assert.notEqual(data[data.length - 1], '<');
        assert.equal(data, content);
      });
    });

    var emittedContent;
    flower.stream2buffer(doc, function (error, buf) {
      assert.ifError(error);
      emittedContent = buf.toString();
    });

    describe('when all containers are filled', function () {
      it('the emmited content should match the document content', function () {
        assert.equal(doc.content, emittedContent);
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
