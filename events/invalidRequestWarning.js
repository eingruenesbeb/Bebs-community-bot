module.exports = {
  name: 'invalidRequestWarning',
  once: false,
  async execute (info) {
    console.log(`Recieved the following warning for invalid requests: "${info}"`)
  }
}
