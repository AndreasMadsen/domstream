/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

function copyDocument(origin) {
  // copy root element
  var root = { isRoot: true };
  copyPosKeys(root, origin);

  // copy each child element
  copyChildrens(root, origin);

  return root;
}
module.exports = copyDocument;

var posKeys = ['afterend', 'beforeend', 'afterbegin', 'beforebegin'], posLength = posKeys.length;
function copyPosKeys(to, from) {
  to = to.pos = {};
  from = from.pos;

  var i = posLength, name;
  while (i--) {
    name = posKeys[i];
    if (from[name] !== undefined) to[name] = from[name];
  }
}

var attrKeys = ['value', 'end', 'name', 'start'], attrLength = attrKeys.length;
function copyAttrKeys(to, from) {
  keys = to.keys = [];
  aTo = to.attr = {};
  aFrom = from.attr;

  from.keys.forEach(function (iName) {
    keys.push(iName);

    var iTo = aTo[iName] = {};
    var iFrom = aFrom[iName];

    var i = attrLength, name;
    while (i--) {
      name = attrKeys[i];
      if (iFrom[name] !== undefined) iTo[name] = iFrom[name];
    }
  });
}

var elemKeys = ['tagname', 'singleton'], elemLength = elemKeys.length;
function copyElem(origin) {
  var elem = {};

  // copy std properties
  copyPosKeys(elem, origin);
  copyAttrKeys(elem, origin);
  elem.tagname = origin.tagname;

  if (origin.singleton) {
    elem.singleton = true;
  } else {
    copyChildrens(elem, origin);
  }

  return elem;
}

function copyChildrens(to, from) {
  var parent = to;
  to = to.childrens = [];
  from = from.childrens;

  from.forEach(function (elem) {
    var copy = copyElem(elem);
        copy.parent = parent;
    to.push( copy );
  });
}
