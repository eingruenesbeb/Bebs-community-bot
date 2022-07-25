/**
 * @module
 * @description This module handles the situation, when the client sends to many invalid requests to the discord API, to avoid a ban for too many in a short amount of time.
 * @todo Add functionality, as warnings are currently just logged!
*/

module.exports = {
  /** The name of the event to listen to */
  name: 'invalidRequestWarning',
  /** whether or not this event should be reacted to only once */
  once: false,
  /**
  * Function to react, whenever the client recieves a warning for an invalid request.
  * @param {InvalidRequestWarningData} info - Contains information about the warning.
  * @async
  */
  async execute (info) {
    console.log(`Recieved the following warning for invalid requests: "${info}"`)
  }
}
