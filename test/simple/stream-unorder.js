/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var vows = require('vows');
var assert = require('assert');
var flower = require('flower');

var common = require('../common.js');
var domstream = common.domstream;

var content = fs.readFileSync(common.template, 'utf8');
var document = domstream(content);

var testsuite = vows.describe('testing document stream - unordered');

var input = document.find().only().elem('input').toValue();
var menu = document.find().only().elem('menu').toValue();
var li = document.find().elem('li').toValue()[1];

testsuite.addBatch({
  'when setting containers': {
    topic: document.container([input, menu, li]),

    'no error should throw': function (error) {
      assert.ifError(error);
    },

    'the containers should be filtered and sorted': function () {
      assert.lengthOf(document.containers, 2);
      assert.strictEqual(document.containers[0], menu);
      assert.strictEqual(document.containers[1], input);
    }
  }
});

testsuite.addBatch({
  'when resumeing output': {
    topic: function () {
      document.once('data', this.callback.bind(this, null));
      document.resume();
    },

    'the first data chunk should emit': function (chunk) {
      assert.equal(chunk, document.content.slice(0, menu.elem.pos.beforebegin));
      assert.notEqual(chunk[chunk.length - 1], '<');
    }
  }
});

testsuite.addBatch({
  'when calling done on the last container': {
    topic: function () {
      var self = this;

      function ondata() {
        self.callback(new Error('data event emitted'), null);
      }

      document.once('data', ondata);
      setTimeout(function() {
        document.removeListener('data', ondata);
        self.callback(null, null);
      }, 200);

      input.setAttr('value', 'foo').done();
    },

    'no data should emit': function (error) {
      assert.ifError(error);
    }
  }
});

testsuite.addBatch({
  'when calling done on the remaining container': {
    topic: function () {
      document.once('data', this.callback.bind(this, null));
      menu.done();
    },

    'the last data chunk should emit': function (data) {
      var content = document.content.slice(
        menu.elem.pos.beforebegin,
        document.tree.pos.beforeend + 1
      );

      assert.notEqual(data[data.length - 1], '<');
      assert.equal(data, content);
    }
  }
});

var emittedContent;
flower.stream2buffer(document, function (error, buf) {
  assert.ifError(error);
  emittedContent = buf.toString();
});

testsuite.addBatch({
  'when all containers are filled': {
    topic: function () {
      this.callback(null, emittedContent);
    },

    'the emmited content should match the document content': function (content) {
      assert.equal(document.content, content);
    }
  }
});

testsuite.exportTo(module);
