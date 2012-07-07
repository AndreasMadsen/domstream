/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var vows = require('vows');
var assert = require('assert');

var common = require('../common.js');
var domstream = common.domstream;

var content = fs.readFileSync(common.template, 'utf8');

vows.describe('testing document copy').addBatch({

  'when creating a new document': {
    topic: domstream(content),

    'and copying it to an new document': {
      topic: function (document) {
        this.callback(null, document, document.copy());
      },

      'the content property should math': function (error, orginal, copy) {
        assert.ifError(error);
        assert.strictEqual(copy.content, orginal.content);
      },

      'the document tree should have been copyied': function (error, orginal, copy) {
        assert.ifError(error);
        common.matchTree(copy.tree, orginal.tree);
      }
    }
  }
}).exportTo(module);
