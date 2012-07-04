/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var path = require('path');

var dirname = path.dirname(module.filename);

exports.domstream = require(path.resolve(dirname, '../domstream.js'));
exports.content = fs.readFileSync(path.resolve(dirname, './fixture/template.html'), 'utf8');
