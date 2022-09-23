const { Tail } = require('tail')
const { post } = require('jsonist')

let [logFile, key, server] = process.argv.slice(2)

if (!logFile || !key) {
  console.error('Error: must specify logfile and key')
  process.exit(1)
}

server = server || 'https://byte-relay.herokuapp.com'

const SEND_INTERVAL = 500

const buffer = []

const tail = new Tail(logFile)
tail.on('line', function (line) {
  buffer.push(line)
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
