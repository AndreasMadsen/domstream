/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var flower = require('flower');
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
      var data; before(function (done) {
        doc.once('data', function (chunk) {
          data = chunk;
          done();
        });
        doc.resume();
      });

      it('the first data chunk should emit', function () {
        assert.equal(data, doc.content.slice(0, menu.elem.pos[0]));
        assert.notEqual(data[data.length - 1], '<');
      });
    });

    describe('when calling done on the last container', function () {
      function ondata() {
        throw new Error('data event emitted');
      }

      before(function () {
        doc.once('data', ondata);
        input.setAttr('value', 'foo').done();
      });


      it('no data should emit', function (done) {
        setTimeout(function() {
          doc.removeListener('data', ondata);
          done();
        }, 200);
      });
    });

    describe('when calling done on the remaining container', function () {

      var data; before(function (done) {
        doc.once('data', function (chunk) {
          data = chunk;
          done();
        });
        menu.done();
      });

      it('the last data chunk should emit', function () {
        var content = doc.content.slice(
          menu.elem.pos[0],
          doc.tree.pos[2] + 1
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
});
