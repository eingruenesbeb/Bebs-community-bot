/* eslint-disable no-unused-expressions */
const data = require('../database-setup')

/**
 * @module
 * @description This module contains classes and methods, to make it easier to handle some stuff, that is related to the Trust-System.
*/

const TrustRoleData = data.TrustRoleData

/**
 * This class is housing a cache and a method to manage said cache.
 * @class
 */
class TrustVoiceHelper {
  static activeUsers = new Map() // Cache of users in a voice channel
  /**
  * This function adds a guild member to the active user cache of this class, if the member is already in the chache, it is removed and the amount of time in milliseconds spent in a voice chat is returned.
  * @param {Snowflake} userid - The id/snowflake of the user, that joined a voice chat.
  * @return {?Number} The amount of time in milliseconds spent in a voice chat is returned.
  */
  static manageActive (userid) {
    if (!this.activeUsers.has(userid)) {
      this.activeUsers.set(userid, Date.now())
      return null
    } else {
      const activeSince = this.activeUsers.get(userid)
      this.activeUsers.delete(userid)
      return Date.now() - activeSince
    }
  }
}

/**
* Basically just takes an object of class "Role" and attaches some more properties
* @param {Number} threshhold - The amount of karma a user needs to pass, before the role will be removed/added
* @param {Boolean} manual - Determines, whether or not a role is automatically assingable (false) or not (true).
* @param {Boolean} inverted - Determines, whether or not a role is assinged on exeeding (false) or subceeding the threshhold (true).
* @return {Role} The role, with the additional properties
*/
function attachTrustProperties (role, threshhold = 0, manual = false, inverted = false) {
  !(threshhold === null) ? role.threshhold = threshhold : role.threshhold = 0
  !(manual === null) ? role.manual = manual : role.manual = false
  !(inverted === null) ? role.inverted = inverted : role.inverted = false
  // Default values: threshhold -> 0, manual -> false, inverted -> false
  return role
}

/**
 * @description This class helps to keep track of and manipulate all the roles currently managed by the Trust-System. 
 * @class
 */
class TrustRolesHelper {
  /** 
   * Cache of all the roles, that are available to the Trust-System
   * @static
   */
  static rolesAvailable = []
  /**
   * Manages the TrustRolesHelper cache. Adding roles if not present and deleting roles if it is present in the cache.
   * @param {Role} role A role, with TrustProperties attached.
   * @async
   */
   static async manage (role) {
    if (this.rolesAvailable.includes(role)) {
      this.rolesAvailable = this.rolesAvailable.filter(item => item !== role)
      await TrustRoleData.destroy({ where: { role_id: role.id } })
      console.log(`Removed ${role.id} from the roles available for the trust system`)
    } else {
      this.rolesAvailable.push(role)
      await TrustRoleData.create({ role_id: role.id, guild_id: role.guild.id, threshhold: role.threshhold, manual: role.manual, inverted: role.inverted }).catch(() => console.log(`The role ${role.id} is already in the trust database!`))
      console.log(`Added ${role.id} to the roles available for the trust system`)
    }
  }

  /**
   * Makes it able, to check, if a role is present in the TrustRolesHelper chache, even if no trust-properties are attached.
   * @param {Role} role The role to check for.
   * @returns {Boolean} True if the role is in the cache
   */
  static has (role) {
    const rolesAvailableSnowflakes = []
    this.rolesAvailable.forEach(item => {
      rolesAvailableSnowflakes.push(item.id)
    })
    return rolesAvailableSnowflakes.includes(role.id)
  }

  /**
    * Edits any role you pass into it. If it isn't currently managed by the trust system, it will be added.
    * @param {Role} role - The role managed by the trust system to be edited/added.
    * @param {Number} newThreshhold - The new threshhold you want to set.
    * @param {Boolean} newManual - The new manual boolean you want to set.
    * @param {Boolean} newInverted - The new inverted boolean you want to set.
    * @async
    */
  static async edit (role, newThreshhold, newManual, newInverted) {
    if (!this.has(role)) return this.manage(attachTrustProperties(role, newThreshhold, newManual, newInverted)) // Check if the role is even on the list of roles available.
    // Extract the entry from the list:
    const toEdit = this.rolesAvailable.filter(item => item.id === role.id)[0]
    this.rolesAvailable = this.rolesAvailable.filter(item => item.id !== role.id)
    // Edit the extracted entry:
    attachTrustProperties(toEdit, newThreshhold, newManual, newInverted)
    // Reinsert the edited entry into the list and update the database accordingly:
    this.rolesAvailable.push(toEdit)
    await TrustRoleData.update({ threshhold: toEdit.threshhold, manual: toEdit.manual, inverted: toEdit.inverted }, { where: { role_id: toEdit.id } })
  }

  /**
    * Deletes a role from the trust-system.
    * @param {Role} role - The role you whish to delete.
    * @async
    */
  static async del (role) {
    if (this.has(role)) {
      this.manage(role)
      await TrustRoleData.destroy({ where: { role_id: role.id } })
    } else console.error('You cannot delete a role in the trust-system, if it doesn\'t exist there!')
  }

  /**
   * Retrieves a given role from the Trust-Roles cache.
   * 
   * @param {Role} role A role which should be searched for in the cache and returned by this function. Also works on roles, without the extra properties.
   * @returns {?Role} The role, passed into this function with all extra properties. null, if not in the cache
   */
  static retrieve (role) {
    let out = null
    this.has(role) ? out = this.rolesAvailable.filter(item => item.id === role.id)[0] : null
    return out
  }

  /**
   * Checks, for what roles managed by the Trust-System a guild member should have access to and applies or removes them, depending on the outcome of the evaluation.
   * 
   * @param {GuildMember} guildMember The guild member to check on, what Trust-Roles should be applied on it.
   * @param {Number} karma The amount of karma the guild member has.
   */
  static async apply (guildMember, karma) {
    // Make a list of all roles that the bot should apply automatically.
    const applicableRoles = this.rolesAvailable.filter(item => (!item.inverted ? item.threshhold < karma : item.threshhold >= karma) && !guildMember.roles.cache.has(item.id) && !item.manual)
    const applicableRolesSnowflakes = []
    applicableRoles.forEach(item => {
      applicableRolesSnowflakes.push(item.id)
    })

    // Make a list of all roles that the bot should remove automatically.
    const removableRoles = this.rolesAvailable.filter(item => (!item.inverted ? item.threshhold > karma : item.threshhold <= karma) && guildMember.roles.cache.has(item.id))
    const removableRolesSnowflakes = []
    removableRoles.forEach(item => {
      removableRolesSnowflakes.push(item.id)
    })

    // Apply desired changes:
    await guildMember.roles.remove(removableRolesSnowflakes, 'Trust-System') // Absolutly has to to be awaited!
    guildMember.roles.add(applicableRolesSnowflakes, 'Trust-System')
  }
}

module.exports = {
  TrustVoiceHelper,
  attachTrustProperties,
  TrustRolesHelper
}
