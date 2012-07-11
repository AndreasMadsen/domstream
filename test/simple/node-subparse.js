/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var vows = require('vows');
var assert = require('assert');

var common = require('../common.js');
var domstream = common.domstream;

var content = '<r>' +
                '<aa></aa>' +
                '<ab>' +
                  '<b></b>' +
                '</ab>' +
                '<ac></ac>' +
              '</r>';
var document = domstream(content);

var testsuite = vows.describe('testing node subparser');

// find and check node
var ElemAB = document.find().only().elem('ab').toValue();
assert.strictEqual(ElemAB.elem, document.tree.childrens[0].childrens[1]);

// activeate subparser
document.live(true);

testsuite.addBatch({
  'when inserting content beforebegin': testResult({
    topic: function () {
      return ElemAB.insert('beforebegin', '<ta></ta>');
    }
  }, '<r><aa></aa><ta></ta><ab><b></b></ab><ac></ac></r>')
});

testsuite.addBatch({
  'when inserting content afterbegin': testResult({
    topic: function () {
      return ElemAB.insert('afterbegin', '<tb></tb>');
    }
  }, '<r><aa></aa><ta></ta><ab><tb></tb><b></b></ab><ac></ac></r>')
});

testsuite.addBatch({
  'when inserting content beforeend': testResult({
    topic: function () {
      return ElemAB.insert('beforeend', '<tc></tc>');
    }
  }, '<r><aa></aa><ta></ta><ab><tb></tb><b></b><tc></tc></ab><ac></ac></r>')
});

testsuite.addBatch({
  'when inserting content afterend': testResult({
    topic: function () {
      return ElemAB.insert('afterend', '<td></td>');
    }
  }, '<r><aa></aa><ta></ta><ab><tb></tb><b></b><tc></tc></ab><td></td><ac></ac></r>')
});

testsuite.addBatch({
  'when appending content': testResult({
    topic: function () {
      return ElemAB.append('<te></te>');
    }
  }, '<r><aa></aa><ta></ta><ab><tb></tb><b></b><tc></tc><te></te></ab><td></td><ac></ac></r>')
});

testsuite.addBatch({
  'when overwriting content': testResult({
    topic: function () {
      return ElemAB.append('<tf></tf>');
    }
  }, '<r><aa></aa><ta></ta><ab><tb></tb><b></b><tc></tc><te></te><tf></tf></ab><td></td><ac></ac></r>')
});

testsuite.addBatch({
  'when overwriting content': testResult({
    topic: function () {
      return ElemAB.setContent('<tb></tb><tc></tc>');
    }
  }, '<r><aa></aa><ta></ta><ab><tb></tb><tc></tc></ab><td></td><ac></ac></r>')
});

testsuite.addBatch({
  'when removeing content': testResult({
    topic: function () {
      return ElemAB.trim();
    }
  }, '<r><aa></aa><ta></ta><ab></ab><td></td><ac></ac></r>')
});

testsuite.addBatch({
  'when removeing element': testResult({
    topic: function () {
      return ElemAB.remove();
    }
  }, '<r><aa></aa><ta></ta><td></td><ac></ac></r>')
});

function testResult(batch, content) {
  batch['the content should match'] = function (node) {
    if (node instanceof Error) throw node;

    assert.strictEqual(node.document.content, content);
  };

  batch['the tree should match'] = function (node) {
    if (node instanceof Error) throw node;

    common.matchTree(node.document.tree, domstream(content).tree);
  };

  return batch;
}

testsuite.exportTo(module);
