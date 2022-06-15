const Canvas = require('@napi-rs/canvas')
const fs = require('fs')

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

/**
 * @class
 * @description This class represents the settings for the look of a poll
 * @property {Number[]} dimensions The [x, y] dimensions of the poll image in pixel.
 * @property {String | null} background The path to the background image. Is null, if no argument is provided, resulting in a transparent background.
 * @property {Map<('bottom', 'left', 'right', 'top'),Number>} imgPadding By how many pixel the poll image should be padded by on each side.
 * @property {function(PollOption[]):PollOption[]} optOrder A function, that sorts the Array of poll options.
 * @property {Map<statistic, Map<option, value>>} stats The statistics to show on the poll currently available: totalVotes, dateCreated, timeOut
 * @property {Map<option, value>} titleStyle How the title should be formatted.
 * @property {Map<option, value>} messageStyle How the title should be formatted.
 * @property {Map<option, value>} head How the poll header should look like.
 * @property {Map<option, value>} footer How the footer of the poll sould look like.
 */
class PollStyle {
  /**
   * @constructor
   * @description This class represents the settings for the look of a poll
   * @param {Number[]} dimensions The [x, y] dimensions of the poll image in pixel.
   * @param {String | null} background The path to the background image. Is null, if no argument is provided, resulting in a transparent background.
   * @param {Map<('bottom', 'left', 'right', 'top'),Number>} imgPadding By how many pixel the poll image should be padded by on each side.
   * @param {function(PollOption[]):PollOption[]} optOrder A function, that sorts the Array of poll options.
   * @param {Map<statistic, Map<option, value>>} stats The statistics to show on the poll currently available: totalVotes, dateCreated, timeOut
   * @param {Map<option, value>} titleStyle How the title should be formatted.
   * @param {Map<option, value>} messageStyle How the title should be formatted.
   * @param {Map<option, value>} head How the poll header should look like.
   * @param {Map<option, value>} footer How the footer of the poll sould look like.
   */
  constructor (
    dimensions, background = null, imgPadding = { bottom: 25, left: 10, right: 10, top: 25 }, optOrder = options => { return options },
    stats = { totalVotes: { alignment: { horizontal: 0, vertical: 0 }, color: '#00c1bb', font: '12px sans-serif' } }, titleStyle = { alignment: { horizontal: 0, vertical: 0 }, fontStyle: 'sans-serif', fontDefSize: 32, color: '#00c1bb' },
    messageStyle = { alignment: { horizontal: 0, vertical: 0 }, fontStyle: 'sans-serif', fontDefSize: 24, color: '#00c1bb' }, head = { padding: { bottom: 24, left: 0, right: 0, top: 0 }, background: null },
    footer = { padding: { bottom: 24, left: 0, right: 0, top: 0 }, background: null }) {
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

/**
 * @class
 * @description This class represents a poll option.
 * @property {String} name The name of the option
 * @property {Map<element, value>} style Defines, how the option should look like.
 * @property {Map<User, amount>} votes Stores information on who voted for this option how often.
 */
class PollOption {
  /**
   * @class
   * @description This class represents a poll option.
   * @param {String} name The name of the option
   * @param {PollOptionStyle} style Defines, how the option should look like.
   * @param {Map<User, amount>} votes Stores information on who voted for this option how often.
   */
  constructor (name, style, votes) {
    this.name = name
    this.style = style
    this.votes = votes
  }

  /**
   * This method should be called, whenever aa user has voted for the option.
   * @param {User} user The user, who voted.
   */
  vote (user) {
    this.votes.has(user.id) ? this.votes.set(user.id, this.votes.get(user.id) + 1) : this.votes.user.id = 1
  }

  buildImage () {
    const canvas = Canvas.createCanvas(this.style.dimensions[0], this.style.dimensions[1])
    const context = canvas.getContext("2d")
    let background = null
    if (this.style.background) {
      try {
        const bgrSource = fs.readFileSync(this.style.background)
        const bgr = new Canvas.Image()
        bgr.src = bgrSource

        context.drawImage(bgr, this.style.padding.left, this.style.padding.bottom, this.style.padding.right)
      }
    }
  }
}

class PollOptionStyle {
  constructor (
    dimensions = [460, 69], padding = { bottom: 5, left: 0, right: 0, top: 5 }, background = null, loadOrder = ['description', 'bar', 'ticker'], optDesc = { alignment: { horizontal: 0, vertical: 0 }, onBar: false },
    bar = { background: ['#5865F2'], edge: ['#000000'], alignment: { horizontal: 0, vertical: 0 } }, ticker = { color: '#FFFFFF', style: 'percentage', onBar: true }) {
    this.dimensions = dimensions
    this.padding = padding
    this.background = background
    this.loadOrder = loadOrder
    this.optDesc = optDesc
    this.bar = bar
    this.ticker = ticker
  }
}
