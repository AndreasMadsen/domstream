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

var testsuite = vows.describe('testing document stream');

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
  'when setting containers twice': {
    topic: function () {
      return document.container([input, menu, li]);
    },

    'an error should throw': function (error) {
      assert.instanceOf(error, Error);
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

// test throw on nodes there are outside an container
var head = document.find().only().elem('head').toValue();
testOfline(head, 'outside an container', true);

// test appending content on subcontainer
testsuite.addBatch({
  'when appending content to subcontainer': {
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

      li.append('new content');
    },

    'no data chunk should emit': function (error) {
      assert.ifError(error);
    }
  },

  'after appending content to subcontaner': {
    topic: function () {
      li.setAttr('foo', 'value');

      return li.getAttr('foo');
    },

    'modification should stil be allowed': function (value) {
      assert.equal(value, 'value');
    }
  }
});

// test appending content on container
testsuite.addBatch({
  'when appending content to container': {
    topic: function () {
      document.once('data', this.callback.bind(this, null));
      menu.append('<li>new item</li>');
    },

    'a data chunks should emit': function (data) {
      var content = document.content.slice(menu.elem.pos.beforebegin, menu.elem.pos.beforeend);
      assert.notEqual(data[data.length - 1], '<');
      assert.equal(data, content);
    }
  }
});

testOfline(menu, 'on a chunked container', false);

testsuite.addBatch({
  'when appending content o a chunked container': {
    topic: function () {
      document.once('data', this.callback.bind(this, null));
      menu.append('<li>new item</li>');
    },

    'a data chunks should emit': function (data) {
      assert.notEqual(data[data.length - 1], '<');
      assert.equal(data, '<li>new item</li>');
    }
  }
});

// test done on an container
testsuite.addBatch({
  'when calling done a container': {
    topic: function () {
      document.once('data', this.callback.bind(this, null));
      menu.done();
    },

    'a data chunks should emit': function (data) {
      assert.notEqual(data[data.length - 1], '<');
      assert.equal(data, '</menu>');
    }
  }
});

testOfline(menu, 'on a done container', true);

// test modifty on a singleton container
testsuite.addBatch({
  'when modifying attributes on a singleton container': {
    topic: function () {
      input.setAttr('foo', 'value');
      return input.getAttr('foo');
    },

    'it should be set': function (value) {
      assert.equal(value, 'value');
    }
  }
});

testsuite.addBatch({
  'when calling done on on a singleton container': {
    topic: function () {
      document.once('data', this.callback.bind(this, null));
      input.done();
    },

    'a data chunk should emit': function (data) {
      var content = document.content.slice(
          menu.elem.pos.beforeend + menu.elem.pos.afterend + 1,
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

// set that everything there should throw, do throws
function testOfline(node, text, testAppend) {
  var test = {};

  function testThrow(fn) {
    return {
      topic: fn,

      'an error should throw': function (error) {
        assert.instanceOf(error, Error);
      }
    };
  }

  test['when trying to set content ' + text] = testThrow(function () {
    node.setContent('fail');
  });

  test['when trying to remove content ' + text] = testThrow(function () {
    node.trim();
  });

  if (testAppend) {
    test['when trying to append content ' + text] = testThrow(function () {
      node.append('fail');
    });
  }

  test['when trying to insert content ' + text] = testThrow(function () {
    node.insert('afterend', 'fail');
  });

  test['when trying to remove attribute ' + text] = testThrow(function () {
    node.removeAttr('fail');
  });

  test['when trying to set attribute ' + text] = testThrow(function () {
    node.setAttr('fail');
  });

  testsuite.addBatch(test);
}

testsuite.exportTo(module);
