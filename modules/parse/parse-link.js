const fetch = require('node-fetch')
const _ = require('lodash')

function matchPastebin(text) {
  const r = /pastebin.com\/([0-9a-zA-Z]+)/g
  return _.head(text.match(r))
}

async function fetchPastebin(url) {
  const [, id] = url.split('/')
  const rawUrl = `http://pastebin.com/raw/${id}`
  const content = await fetch(rawUrl)
  return content.text()
}

function matchHastebin(text) {
  const r = /hastebin.com\/([0-9a-zA-Z]+)/g
  return _.head(text.match(r))
}

async function fetchHastebin(url) {
  const [, id] = url.split('/')
  const rawUrl = `http://hastebin.com/raw/${id}`
  const content = await fetch(rawUrl, {
    headers: { 'Content-Type': 'text/plain', Accept: 'text/plain' }
  })
  return content.text()
}

function parseLink(text) {
  const pasteLink = matchPastebin(text)
  if (pasteLink) {
    return fetchPastebin(pasteLink)
  }
  const hasteLink = matchHastebin(text)
  if (hasteLink) {
    return fetchHastebin(hasteLink)
  }
}

module.exports = {
  parseLink,
  matchPastebin,
  fetchPastebin,
  matchHastebin,
  fetchHastebin
}
