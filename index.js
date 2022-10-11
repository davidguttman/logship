const fs = require('fs')
const path = require('path')
const { Tail } = require('tail')
const { post } = require('jsonist')

let [logDir, key, server] = process.argv.slice(2)

if (!logDir || !key) {
  console.error('Error: must specify logfile and key')
  process.exit(1)
}

server = server || 'https://relay.thhis.com'

const SEND_INTERVAL = 500

const tails = {}
const buffer = []

fs.watch(logDir, function (eventType, filename) {
  if (tails[filename]) return

  const tail = tails[filename] = new Tail(path.join(logDir, filename))
  tail.on('line', function (line) {
    buffer.push({filename, line})
  })
})

sendLoop()

function sendLoop () {
  const toSend = buffer.splice(0)

  if (!toSend.length) return setTimeout(sendLoop, SEND_INTERVAL)

  console.log(toSend.length)

  post(`${server}/${key}`, toSend, function () {
    setTimeout(sendLoop, SEND_INTERVAL)
  })
}
