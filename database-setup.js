// Require Sequelize
const Sequelize = require('sequelize')
// eslint-disable-next-line no-unused-vars
const { user, password } = require('./config.json')

/**
 * @constant sequelize_ Information about the bot's database. Databases dialects other than sqlite might require additional parameters.
 * @type Sequelize
 * @private
 */
const sequelize_ = new Sequelize({
  dialect: 'sqlite',
  logging: false,
  storage: './data/database.sqlite'
})

// Create Trust-datatables:
/**
 * @constant GeneralGuildData A datatable to store general information about a Guild
 * @private
 */
const GeneralGuildData_ = sequelize_.define('general guild', {
  guild_id: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true
  },
  last_checked_audit_log_deleted_amount: Sequelize.INTEGER,
  last_checked_audit_log_deleted_id: Sequelize.STRING
})

/**
 * @constant TrustGuildData_ The datatable for everything that has to do with guilds in the Trust-System.
 * @private
 */
const TrustGuildData_ = sequelize_.define('trust-system guild', {
  guildid: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true
  },
  guild_enabled: Sequelize.INTEGER,
  karma_message: Sequelize.INTEGER,
  karma_vcminute: Sequelize.INTEGER,
  karma_message_del: Sequelize.INTEGER,
  karma_time_out: Sequelize.INTEGER,
  karma_kick: Sequelize.INTEGER,
  karma_ban: Sequelize.INTEGER,
  kick_last_checked: {
    type: Sequelize.STRING,
    unique: true
  }
})
/**
 * @constant TrustUserData_ The datatable for everything that has to do with users in the Trust-System.
 * @private
 */
const TrustUserData_ = sequelize_.define('trust-system user', {
  guild_user_id: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true
  },
  user_enabled: Sequelize.INTEGER,
  karma: {
    type: Sequelize.REAL,
    defaultValue: 0,
    allowNull: false
  }
})
/**
 * @constant TrustRoleData_ The datatable for everything that has to do with roles in the Trust-System.
 * @private
 */
const TrustRoleData_ = sequelize_.define('trust-system roles', {
  role_id: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true
  },
  guild_id: {
    type: Sequelize.STRING,
    allowNull: false
  },
  threshhold: {
    type: Sequelize.REAL,
    defaultValue: 0
  },
  manual: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  inverted: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
})

module.exports = {
  /**
   * A sequelize model representing the general information useful for the bot.
   * @type Model
   */
  GeneralGuildData: GeneralGuildData_,
  /**
    * A sequelize model representing the datatable holding the necessary user data for the Trust-System.
    * @type Model
    */
  TrustUserData: TrustUserData_,
  /**
    * A sequelize model representing the datatable holding the necessary guild data for the Trust-System.
    * @type Model
    */
  TrustGuildData: TrustGuildData_,
  /**
    * A sequelize model representing the datatable holding the necessary role data for the Trust-System
    * @type Model
    */
  TrustRoleData: TrustRoleData_,
  /**
    * Information about the bot's database
    * @type Sequelize
    */
  sequelize: sequelize_
}
