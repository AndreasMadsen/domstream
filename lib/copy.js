/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

// NOTE: this is optimised for v8, be sure to check that
// any change is actually faster.

function copyDocument(origin) {
  // copy root element
  var root = {
    isRoot: true,
    pos: {
      beforebegin: origin.pos.beforebegin,
      afterbegin: origin.pos.afterbegin,
      beforeend: origin.pos.beforeend,
      afterend: origin.pos.afterend
    }
  };

  // copy each child element
  copyChildrens(root, origin);

  return root;
}
module.exports = copyDocument;

function copyElem(origin, parent) {
  var oPos, elem, oKeys, cKeys, aTo, aFrom, i, name, oAttr;

  oKeys = origin.keys;
  oPos = origin.pos;
  elem = {
    tagname: origin.tagname,
    singleton: origin.singleton,

    pos: {
      beforebegin: oPos.beforebegin,
      afterbegin: oPos.afterbegin,
      beforeend: oPos.beforeend,
      afterend: oPos.afterend
    },

    parent: parent,
    attr: {},
    keys: oKeys.slice(0)
  };

  // copy attributes
  cKeys = elem.keys;
  aTo = elem.attr;
  aFrom = origin.attr;

  i = oKeys.length;
  while (i--) {
    name = oKeys[i];
    oAttr = aFrom[name];
    aTo[name] = {
      start: oAttr.start,
      name: oAttr.name,
      end: oAttr.end,
      value: oAttr.value
    };
  }

  // copy childrens
  if (!origin.singleton) {
    copyChildrens(elem, origin);
  }

  return elem;
}

function copyChildrens(to, from) {
  var push = to.childrens = [];

  // childrens must be copied to propper order
  for (var l = from.childrens.length, i = 0; i < l; i++) {
    push.push(copyElem(from.childrens[i], to));
  }
}
