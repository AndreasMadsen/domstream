/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var chai = require('chai');
var common = require('../common.js');
var domstream = common.domstream;

describe('testing node modifier', function () {
  var assert = chai.assert;
  var content = '<a><b aa ab=b><br ac ad="d"/><d ae af="f"></d></b><e></e><hr/></a>';

  common.createContent(content, function (content) {
    var doc = domstream(content);

    // find and check node
    var root = doc.find().only().elem('a').toValue().getParent();
    while (!root.isRoot()) {
      root = root.getParent();
    }
    assert.ok(root.elem === doc.tree);

    var elemA = doc.find().only().elem('a').toValue();
    assert.ok(elemA.elem === doc.tree.childrens[0]);

    var elemB = doc.find().only().elem('b').toValue();
    assert.ok(elemB.elem === doc.tree.childrens[0].childrens[0]);

    // test attribute modification
    describe('test attribute modification', function () {
      describe('when removeing attribute', testResult({
        expect: '<a><b  ab=b><br ac ad="d"/><d ae af="f"></d></b><e></e><hr/></a>',

        topic: function () {
          return elemB.removeAttr('aa');
        },

        'getting the attribute': {
          topic: function (node) {
            return node.getAttr('aa');
          },

          'should return null': function (value) {
            assert.isNull(value);
          }
        }
      }));

      describe('when removeing attribute from root', expectError(function () {
        root.removeAttr('fake');
      }));

      describe('when modifying attribute', testResult({
        expect: '<a><b  ab="new"><br ac ad="d"/><d ae af="f"></d></b><e></e><hr/></a>',

        topic: function () {
          return elemB.setAttr('ab', 'new');
        },

        'getting the attribute': {
          topic: function (node) {
            return node.getAttr('ab');
          },

          'should return new value': function (value) {
            assert.equal(value, 'new');
          }
        }
      }));

      describe('when adding attribute', testResult({
        expect: '<a><b  ab="new" aaa="set"><br ac ad="d"/><d ae af="f"></d></b><e></e><hr/></a>',

        topic: function () {
          return elemB.setAttr('aaa', 'set');
        },

        'getting the attribute': {
          topic: function (node) {
            return node.getAttr('aaa');
          },

          'should return set value': function (value) {
            assert.equal(value, 'set');
          }
        }
      }, '<a><b  ab="new" aaa="set"><br ac ad="d"/><d ae af="f"></d></b><e></e><hr/></a>'));

      describe('when modifying attribute from root', expectError(function () {
        root.setAttr('fake', 'fail');
      }));
    });

    // test content modification
    describe('test content modification', function () {
      describe('when inserting content beforebegin', testResult({
        expect: '<a>bb<b  ab="new" aaa="set"><br ac ad="d"/><d ae af="f"></d></b><e></e><hr/></a>',

        topic: function () {
          return elemB.insert('beforebegin', 'bb');
        },

        'getting parent content': {
          topic: function () {
            return elemA.getContent();
          },

          'should match expected result': function (outer) {
            assert.equal('bb<b  ab="new" aaa="set"><br ac ad="d"/><d ae af="f"></d></b><e></e><hr/>', outer);
          }
        }
      }));

      describe('when inserting content beforebegin on root', expectError(function () {
        root.insert('beforebegin', 'bb');
      }));

      describe('when inserting content afterbegin', testResult({
        expect: '<a>bb<b  ab="new" aaa="set">ab<br ac ad="d"/><d ae af="f"></d></b><e></e><hr/></a>',

        topic: function () {
          return elemB.insert('afterbegin', 'ab');
        },

        'getting content': {
          topic: function (node) {
            return node.getContent();
          },

          'should match expected result': function (inner) {
            assert.equal('ab<br ac ad="d"/><d ae af="f"></d>', inner);
          }
        }
      }));

      describe('when inserting content beforeend', testResult({
        expect: '<a>bb<b  ab="new" aaa="set">ab<br ac ad="d"/><d ae af="f"></d>be</b><e></e><hr/></a>',

        topic: function () {
          return elemB.insert('beforeend', 'be');
        },

        'getting content': {
          topic: function (node) {
            return node.getContent();
          },

          'should match expected result': function (inner) {
            assert.equal('ab<br ac ad="d"/><d ae af="f"></d>be', inner);
          }
        }
      }));

      describe('when inserting content afterend', testResult({
        expect: '<a>bb<b  ab="new" aaa="set">ab<br ac ad="d"/><d ae af="f"></d>be</b>ae<e></e><hr/></a>',

        topic: function () {
          return elemB.insert('afterend', 'ae');
        },

        'getting parent content': {
          topic: function () {
            return elemA.getContent();
          },

          'should match expected result': function (outer) {
            assert.equal('bb<b  ab="new" aaa="set">ab<br ac ad="d"/><d ae af="f"></d>be</b>ae<e></e><hr/>', outer);
          }
        }
      }));

      describe('when inserting content afterend on root', expectError(function () {
        root.insert('afterend', 'ae');
      }));

      describe('when appending content', testResult({
        expect: '<a>bb<b  ab="new" aaa="set">ab<br ac ad="d"/><d ae af="f"></d>beap</b>ae<e></e><hr/></a>',

        topic: function () {
          return elemB.append('ap');
        },

        'getting content': {
          topic: function (node) {
            return node.getContent();
          },

          'should match expected result': function (inner) {
            assert.equal('ab<br ac ad="d"/><d ae af="f"></d>beap', inner);
          }
        }
      }));
    });

  });

  common.createContent(content, function (content) {
    var overwrite = domstream(content);

    var elemOB = overwrite.find().only().elem('b').toValue();
    assert.ok(elemOB.elem === overwrite.tree.childrens[0].childrens[0]);

    describe('when overwriting content', testResult({
      expect: '<a><b aa ab=b>overwrite</b><e></e><hr/></a>',

      topic: function () {
        return elemOB.setContent('overwrite');
      },

      'getting content': {
        topic: function (node) {
          return node.getContent();
        },

        'should match expected result': function (inner) {
          assert.equal(inner, 'overwrite');
        }
      }
    }));

  });

  common.createContent(content, function (content) {
    var remove = domstream(content);

    var elemRB = remove.find().only().elem('b').toValue();
    assert.ok(elemRB.elem === remove.tree.childrens[0].childrens[0]);

    describe('when removeing content', testResult({
      expect: '<a><b aa ab=b></b><e></e><hr/></a>',

      topic: function () {
        return elemRB.trim();
      },

      'getting content': {
        topic: function (node) {
          return node.getContent();
        },

        'should match expected result': function (inner) {
          assert.equal(inner, '');
        }
      }
    }));

  });

  function testResult(batch) {
    var content = batch.expect;
    delete batch.expect;

    batch['the content should match'] = function (node) {
      assert.strictEqual(node.document.content, content);
    };

    batch['the tree should match'] = function (node) {
      common.matchTree(node.document.tree, domstream(content).tree);
    };

    return createMochaTest(batch, {});
  }

  function createMochaTest(batch, prev) {
    return function () {

      if (batch.topic) {
        // setup topic
        var topic = batch.topic;
        delete batch.topic;

        var curr = {};
        before(function () {
          curr.result = topic(prev.result);
        });
      }

      for (var key in batch) (function (key) {
        if (batch[key] instanceof Function) {
          if (batch[key].length == 2) {
            it(key, function (done) {
              batch[key](curr.result, done);
            });
          } else {
            it(key, function () {
              batch[key](curr.result);
            });
          }
        } else {
          describe(key, createMochaTest(batch[key], curr));
        }
      })(key);
    };
  }

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
});
