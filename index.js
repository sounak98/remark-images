const isUrl = require('is-url')
const visit = require('unist-util-visit-parents')
const convert = require('unist-util-is/convert')

const isImgExt = str => /\.(svg|png|jpg|jpeg|gif)$/.test(str)
const isAbsolutePath = str => str.startsWith('/')
const isRelativePath = str => str.startsWith('./') || str.startsWith('../')
const isImgPath = str => isAbsolutePath(str) || isRelativePath(str)
const isInteractive = convert(['link', 'linkReference'])

module.exports = images

function images() {
  return transform
}

function transform(tree) {
  visit(tree, 'text', ontext)
}

function ontext(node, parents) {
  const value = String(node.value).trim()

  if ((isUrl(value) || isImgPath(value)) && isImgExt(value)) {
    let interactive = false
    let length = parents.length
    const siblings = parents[length - 1].children

    // Check if we’re in interactive content.
    while (length--) {
      if (isInteractive(parents[length])) {
        interactive = true
        break
      }
    }

    let next = {
      type: 'image',
      url: value,
      title: null,
      alt: null,
      position: node.position
    }

    // Add a link if we’re not already in one.
    if (!interactive) {
      next = {
        type: 'link',
        url: value,
        title: null,
        children: [next],
        position: node.position
      }
    }

    siblings[siblings.indexOf(node)] = next
  }
}
