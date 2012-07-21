/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var chai = require('chai');
var common = require('../common.js');
var domstream = common.domstream;

describe('testing document copy', function () {
  var assert = chai.assert;
  common.createTemplate(function (content) {

    describe('when creating a new document', function () {
      var orginal = domstream(content);

      describe('and copying it to an new document', function () {
        var copy = orginal.copy();

        it('the content property should math', function () {
          assert.strictEqual(copy.content, orginal.content);
        });

        it('the document tree should have been copyied', function () {
          common.matchTree(copy.tree, orginal.tree);
        });
      });

    });
  });
});
