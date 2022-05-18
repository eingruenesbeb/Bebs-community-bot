// Require Sequelize
const Sequelize = require('sequelize')

// Connection information about the bot's database
const sequelize_ = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: './data/database.sqlite'
})

// Create Trust-datatables:
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
  karma_ban: Sequelize.INTEGER
}) // The data if guilds use the trust system and the values for the different actions on guild members.
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
}) // The actual user data for the trust system.
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
}) // The data for roles that can be used by the trust system.

module.exports = {
  TrustUserData: TrustUserData_,
  TrustGuildData: TrustGuildData_,
  TrustRoleData: TrustRoleData_,
  sequelize: sequelize_
}
