const canvas = require('@napi-rs/canvas')

/**
 * @class
 * @description This class represents a 'fancy' poll, with all the neccessary bits and bobs.
 * @property {String} id The message id, that houses the poll.
 * @property {String} name The name that was given to the poll, for easier access.
 * @property {String[]} voteOpt The options, that can be voted upon.
 * @property {Number} timeOut How long this poll should be open in ms.
 * @property {Number} selfDestruct If and how long after the poll has timed out, the message containing the poll and any reference to it should get deleted in ms.
 * @property {Snowflake[]} canVote A list of User-/Role-IDs, that can vote. Is empty, if everyone can.
 * @property {Snowflake[]} canEdit A list of User-/Role-IDs/Permissions, that can edit the poll. Is empty, if everyone can, but usually contains the ID of the one who created the poll and the administrator permission.
 * @property {String} mode Supports two poll modes: "button", which is the default meaning, that the poll will present all options as clickable buttons below the (only supports 20 options),
 * and "dedicated" meaning, that the option a user wants to vote on has to be typed out in the channel the poll is in and all subsequent messages are sent in the channel are deleted (supports ALL the options).
 * @property {String | Map<String, any>} style The style of the poll.
 */
class Poll {
  /**
     *
     * @param {String} id The message id, that houses the poll.
     * @param {String} name The name that was given to the poll, for easier access.
     * @param {String} question The question asked in the poll.
     * @param {String[]} voteOpt The options, that can be voted upon.
     * @param {Number} timeOut How long this poll should be open in ms.
     * @param {Number} selfDestruct If and how long after the poll has timed out, the message containing the poll and any reference to it should get deleted in ms.
     * @param {Snowflake[]} canVote A list of User-/Role-IDs, that can vote. Is empty, if everyone can.
     * @param {Snowflake[]} canEdit A list of User-/Role-IDs/Permissions, that can edit the poll. Is empty, if everyone can, but usually contains the ID of the one who created the poll and the administrator permission.
     * @param {Map<Number, Number, Boolean>} voteLimit The amount of times a user can vote, the amount of options that can be selected at once and if a user can choose an option more than once. Format {maxVotes, maxAtOnce, canWeight}
     * @param {String} mode Supports two poll modes: "button", which is the default meaning, that the poll will present all options as clickable buttons below the (only supports 20 options),
     * and "dedicated" meaning, that the option a user wants to vote on has to be typed out in the channel the poll is in and all subsequent messages are sent in the channel are deleted (supports ALL the options).
     * @param {String | Map<String, any>} style The style of the poll.
     */
  constructor (id, name, question, voteOpt, timeOut, selfDestruct, canVote, canEdit, voteLimit, mode = 'button', style = 'default') {
    this.id = id
    this.name = name
    this.question = question
    this.voteOpt = voteOpt
    this.timeOut = timeOut
    this.selfDestruct = selfDestruct
    this.canVote = canVote
    this.canEdit = canEdit
    this.voteLimit = voteLimit
    this.mode = mode
    this.style = style

    // This stores what and how often users have voted:
    this.hasVoted = {} // Should be formatted like this: {userId: {optionName: amount, ...}, ...}

    // The style options:
    // Preset 'default':
    const defStyle = {
      // Settings for the poll image as a whole:
      background: null, // Can be either an image or null
      imgPadding: { bottom: 25, left: 10, right: 10, top: 25 }, // All values are in absolute pixel
      // Settings for individual options:
      loadOrder: ['description', 'bar', 'ticker'], // If multiple parts have the same alignment, put the first item on this list further to the side.
      optDesc: { alignment: 'left', onBar: false },
      bar: { background: ['#5865F2'], edge: ['#000000'], alignment: 'left' }, // Background can be a color or an image. Edge and background array format: [left cap, centre, right cap] or [entire bar]
      ticker: { color: '#FFFFFF', style: 'percentage', onBar: true } // Available styles: "percentage", "absolutes", "percentage first", "absolutes first", null

    }

    // Draw a box for each option in the poll.
  }
}

class PollStyle {
  constructor (
    dimensions, background = null, imgPadding = { bottom: 25, left: 10, right: 10, top: 25 }, optOrder = options => { return options },
    stats = { totalVotes: { alignment: { horizontal: 0, vertical: 0 }, color: '#00c1bb', font: '12px sans-serif' } }, titleStyle = { alignment: { horizontal: 0, vertical: 0 }, fontStyle: 'sans-serif', fontDefSize: 32, color: '#00c1bb' },
    messageStyle = { alignment: { horizontal: 0, vertical: 0 }, fontStyle: 'sans-serif', fontDefSize: 24, color: '#00c1bb' }, head = { padding: { bottom: 24, left: 0, right: 0, top: 0 }, background: null, includes: ['title', 'question'] },
    footer = { padding: { bottom: 24, left: 0, right: 0, top: 0 }, background: null, includes: ['title', 'question'] }) {
    this.background = background
    this.dimensions = dimensions
    this.imgPadding = imgPadding
    this.optOrder = optOrder
    this.stat = stats
    this.titleStyle = titleStyle
    this.messageStyle = messageStyle
    this.head = head
    this.footer = footer
  }
}

class PollOption {
  constructor (name, style, votes) {

  }
}

class PollOptionStyle {
  constructor (
    dimensions = [460, 69], padding = { bottom: 5, left: 0, right: 0, top: 5 }, background = null, loadOrder = ['description', 'bar', 'ticker'], optDesc = { alignment: 'left', onBar: false },
    bar = { background: ['#5865F2'], edge: ['#000000'], alignment: 'left' }, ticker = { color: '#FFFFFF', style: 'percentage', onBar: true }) {
    this.dimensions = dimensions
    this.padding = padding
    this.background = background
    this.loadOrder = loadOrder
    this.optDesc = optDesc
    this.bar = bar
    this.ticker = ticker
  }
}
