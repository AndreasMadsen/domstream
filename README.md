#domstream

> domstream is document orintered model there supports sending chunks
> as the html file gets build. It should be noted that domstream is not
> a real DOM, but string based. This allow a much faster build process
> but the unfortunat is that domstream requires a very pretty html document
> and is not as sufisticated as the real DOM.

##Installation

```sheel
npm install domstream
```

##Example

```JavaScript
var domstream = require('domstream');
var fs = require('fs');

// domstream needs something to start with, since it works
// with relative positions. Of course that can just be
// "<html></html>" but why read from a static file to reduse
// computations. This will also allow the content to be send
// in more chunks.
var base = fs.readFileSync('./template.html', 'utf8');

// create a new tree
var tree = domstream(content);
var document = tree.create().pipe(process.stdout);

// find all containers
var nodes = [
  document.find().elem('title'),
  document.find().elem('head'),
  document.find().all().elem('li').attr('class', 'menu'),
  document.find().attr('id', 'main')
];

// we will need to preatach there position to the tree
// so it knowns when a chunk is ready to be send.
document.container(nodes);

// very simple add content "Document title" to title element
nodes[0]
  // will remove all content, there is no for this extra computation
  // if we know the element is empty
  .remove()
  // will add content just before endtag
  .append('Document title')
  // will send the content if all node parents are done too
  .done();

// just before the end of head add a script
nodes[1]
  // .insert is equal to DOM.insertAdjacentHTML
  .insert('beforeend', '<script>console.log('added script in head');</script>')
  // this is a node parent to nodes[0] so it is first at this point the content
  // will be send. Doing nodes[0].insert('afterend') is more performant, but this
  // should be supported to.
  .done();

// .find() where .all() was called returns an array of nodes.
nodes[2].forEach(function (node, index) {
  // will set content and a attribute
  node
    // again content is not automaticly removed
    .remove()
    .append('Menu #' + index)

    // so goes for attributes
    .attrRemove('data-id')
    .attrAdd('data-id', index)

    // send chunks
    .done();

// If domstream do not support sending list-items as the come in from an database
// request, the the module failed in its goal.
databaseRequest
  // this can be done at any time
  .ready(function () {
    nodes[3].remove();
  })
  // for each new row
  .each(function (content) {
    // append will attually send content too if there is no parent waiting
    // so after calling .append .attrRemove, .attrAdd and .insert is not allowed
    // since that may require a rollback.
    nodes[3]
      .append('<li>' + content '<li>');
  })
  .end(function () {
    // In this case .done will only send the end tag
    nodes[3].done();
  });
```

##API documentation

##License

**The software is license under "MIT"**

> Copyright (c) 2012 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
