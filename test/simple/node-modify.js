/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var vows = require('vows');
var assert = require('assert');

var common = require('../common.js');
var domstream = common.domstream;

var content = '<a><b aa ab="b"><c ac ad="d"/><d ae af="f"></d></b><e></e><f/></a>';
var document = domstream(content);

var testsuite = vows.describe('testing node modifier');

// find and check node
var root = document.find().only().elem('a').toValue().getParent();
assert.strictEqual(root.elem, document.tree);

var elemA = document.find().only().elem('a').toValue();
assert.strictEqual(elemA.elem, document.tree.childrens[0]);

var elemB = document.find().only().elem('b').toValue();
assert.strictEqual(elemB.elem, document.tree.childrens[0].childrens[0]);

// test attribute modification
testsuite.addBatch({
  'when removeing attribute': testResult({
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
  }, '<a><b  ab="b"><c ac ad="d"/><d ae af="f"></d></b><e></e><f/></a>')
});

testsuite.addBatch({
  'when removeing attribute from root': {
    topic: function () {
      return root.removeAttr('fake');
    },

    'it should throw': function (error) {
      assert.instanceOf(error, Error);
    }
  }
});

testsuite.addBatch({
  'when modifying attribute': testResult({
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
  }, '<a><b  ab="new"><c ac ad="d"/><d ae af="f"></d></b><e></e><f/></a>')
});

testsuite.addBatch({
  'when adding attribute': testResult({
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
  }, '<a><b  ab="new" aaa="set"><c ac ad="d"/><d ae af="f"></d></b><e></e><f/></a>')
});

testsuite.addBatch({
  'when modifying attribute from root': {
    topic: function () {
      return root.setAttr('fake', 'fail');
    },

    'it should throw': function (error) {
      assert.instanceOf(error, Error);
    }
  }
});

// test content modification
testsuite.addBatch({
  'when inserting content beforebegin': testResult({
    topic: function () {
      return elemB.insert('beforebegin', 'bb');
    },

    'getting parent content': {
      topic: function () {
        return elemA.getContent();
      },
      'should match expected result': function (outer) {
        assert.equal(outer, 'bb<b  ab="new" aaa="set"><c ac ad="d"/><d ae af="f"></d></b><e></e><f/>');
      }
    }
  }, '<a>bb<b  ab="new" aaa="set"><c ac ad="d"/><d ae af="f"></d></b><e></e><f/></a>')
});

testsuite.addBatch({
  'when inserting content beforebegin on root': {
    topic: function () {
      return root.insert('beforebegin', 'bb');
    },

    'it should throw': function (error) {
      assert.instanceOf(error, Error);
    }
  }
});

testsuite.addBatch({
  'when inserting content afterbegin': testResult({
    topic: function () {
      return elemB.insert('afterbegin', 'ab');
    },

    'getting content': {
      topic: function (node) {
        return node.getContent();
      },
      'should match expected result': function (inner) {
        assert.equal(inner, 'ab<c ac ad="d"/><d ae af="f"></d>');
      }
    }
  }, '<a>bb<b  ab="new" aaa="set">ab<c ac ad="d"/><d ae af="f"></d></b><e></e><f/></a>')
});

testsuite.addBatch({
  'when inserting content beforeend': testResult({
    topic: function () {
      return elemB.insert('beforeend', 'be');
    },

    'getting content': {
      topic: function (node) {
        return node.getContent();
      },
      'should match expected result': function (inner) {
        assert.equal(inner, 'ab<c ac ad="d"/><d ae af="f"></d>be');
      }
    }
  }, '<a>bb<b  ab="new" aaa="set">ab<c ac ad="d"/><d ae af="f"></d>be</b><e></e><f/></a>')
});

testsuite.addBatch({
  'when inserting content afterend': testResult({
    topic: function () {
      return elemB.insert('afterend', 'ae');
    },

    'getting parent content': {
      topic: function () {
        return elemA.getContent();
      },
      'should match expected result': function (outer) {
        assert.equal(outer, 'bb<b  ab="new" aaa="set">ab<c ac ad="d"/><d ae af="f"></d>be</b>ae<e></e><f/>');
      }
    }
  }, '<a>bb<b  ab="new" aaa="set">ab<c ac ad="d"/><d ae af="f"></d>be</b>ae<e></e><f/></a>')
});

testsuite.addBatch({
  'when inserting content afterend on root': {
    topic: function () {
      return root.insert('afterend', 'ae');
    },

    'it should throw': function (error) {
      assert.instanceOf(error, Error);
    }
  }
});

testsuite.addBatch({
  'when appending content': testResult({
    topic: function () {
      return elemB.append('ap');
    },

    'getting content': {
      topic: function (node) {
        return node.getContent();
      },
      'should match expected result': function (inner) {
        assert.equal(inner, 'ab<c ac ad="d"/><d ae af="f"></d>beap');
      }
    }
  }, '<a>bb<b  ab="new" aaa="set">ab<c ac ad="d"/><d ae af="f"></d>beap</b>ae<e></e><f/></a>')
});

// test content overwrite
var overwrite = domstream(content);
    overwrite.container([overwrite.find().only().elem('a').toValue()]);

var elemOB = overwrite.find().only().elem('b').toValue();
assert.strictEqual(elemOB.elem, overwrite.tree.childrens[0].childrens[0]);

testsuite.addBatch({
  'when overwriting content': testResult({
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
  }, '<a><b aa ab="b">overwrite</b><e></e><f/></a>')
});

// test content remove
var remove = domstream(content);
    remove.container([remove.find().only().elem('a').toValue()]);

var elemRB = remove.find().only().elem('b').toValue();
assert.strictEqual(elemRB.elem, remove.tree.childrens[0].childrens[0]);

testsuite.addBatch({
  'when removeing content': testResult({
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
  }, '<a><b aa ab="b"></b><e></e><f/></a>')
});


function testResult(batch, content) {
  batch['the content should match'] = function (node) {
    assert.strictEqual(node.document.content, content);
  };

  batch['the tree should match'] = function (node) {
    common.matchTree(node.document.tree, domstream(content).tree);
  };

  return batch;
}

testsuite.exportTo(module);
