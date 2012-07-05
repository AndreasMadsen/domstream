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
var document = domstream(content);

var testsuite = vows.describe('testing document search');

testsuite.addBatch({

  'when searching for a missing element using': {

    'tagname':
      expectNoResult(document.find().elem('missing')),
      
    'attribute name':
      expectNoResult(document.find().attr('missing')),
    
    'attribute value':
      expectNoResult(document.find().attr('rel', 'missing')),
    
    'tagname followed by attribute value':
      expectNoResult(document.find().elem('link').attr('data-match', '1')),
    
    'attribute followed by tagname value':
      expectNoResult(document.find().attr('data-match', '1').elem('missing')),
      
    'multiply steps': expectNoResult(function () {
      var search = document.find();
      
      // this will perform a real search for all <link> element
      search.elem('link');
      search.toArray();
      
      // this will setup search for all <link data-match="1" *>
      // note that such elements do not exist, but a <link *> element and <* data-match="1" *> do.
      search.attr('data-match', '1');
      
      return search;
    })
  }
});

function expectNoResult(query) {
  return {
    topic: query,
    
    'toValue returns false': function (search) {
      assert.isFalse(search.toValue());
    },
    
    'toArray returns empty array': function (search) {
      assert.lengthOf(search.toArray(), 0);
      assert.isEmpty(search.toArray());
    } 
  };
}

testsuite.exportTo(module);
