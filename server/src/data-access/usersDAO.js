import { ObjectId } from "mongodb"

let users
let userSessions
export default class UsersDAO {

  static async injectDB(conn) {
    if (users && userSessions) {
      return
    }
    try {
      users = await conn.db(process.env.DB_NS).collection("users")
      userSessions = await conn.db(process.env.DB_NS).collection("userSessions")
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`)
    }
  }

  /**
   * Find a user in the `users` collection
   * @param {string} username - The user name of the desired user
   * @returns {Object | null} Returns either a single user or nothing
   */
   static async getUserByUsername(username) {
    try {
      return await users.findOne({ username })
    } catch (e) {
      console.error(`Error occurred while retrieving user, ${e}`)
      return null
    }
  }

  static async getUserById(userId) {
    try {
      return await users.findOne({ userId })
    } catch (e) {
      console.error(`Error occurred while retrieving user, ${e}`)
      return null
    }
  }

  static async getUserByEmail(email) {
    try {
      return await users.findOne({ email })
    } catch (e) {
      console.error(`Error occurred while retrieving user, ${e}`)
      return null
    }
  }

  /**
   * Gets a user from the `userSessions` collection
   * @param {string} username - The user name of the desired user in 'userSessions' collection
   * @returns {Object | null} Returns a user session Object, an "error" Object
   * if something went wrong, or null if user was not found.
   */
  static async getUserSession(username) {
    try {
      return userSessions.findOne({ username })
    } catch (e) {
      console.error(`Error occurred while retrieving user session, ${e}`)
      return null
    }
  }
  
  /**
   * Adds a user to the `users` collection
   * @param {UserInfo} userInfo - The information of the user to add
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  /*static async addUser(user) {
    try {
      await users.insertOne(user, { w: "majority" })
      return { success: true }
    } catch (e) {
      console.error(`Error occurred while adding new user, ${e}`)
      if (String(e).startsWith("MongoServerError: E11000 duplicate key error")) {
        return { error: "A user with the given email already exists." }
      }
      
    }
  }*/

  static async addUser(user) {
    await users.insertOne(user, { w: "majority" })
    .then(success => { return { success }})
    .catch(error => { throw new Error(error) })
  }


  /**
   * Adds a user to the `userSessions` collection
   * @param {string} email - The email of the user to login
   * @param {string} jwt - A JSON web token representing the user's claims
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async loginUser(user, token) {
    try {
      let query = user
      let update = { $set: { user, token }}
      let upsert = { upsert: true }
      await userSessions.updateOne(query, update, upsert)
      return { success: true }
    } catch (e) {
      console.error(`Error occurred while logging in user, ${e}`)
      return { error: e }
    }
  }

  /**
   * Removes a user from the `sessons` collection
   * @param {string} email - The email of the user to logout
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async logoutUser(username) {
    try {
      await userSessions.deleteOne({ username })
      return { success: true }
    } catch (e) {
      console.error(`Error occurred while logging out user, ${e}`)
      return { error: e }
    }
  }

  /**
   * Removes a user from the `userSessions` and `users` collections
   * @param {string} email - The email of the user to delete
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async deleteUser(username) {
    try {
      await users.deleteOne({ username })
      await userSessions.deleteOne({ username })
      if (!(await this.getUser(username)) && !(await this.getUserSession(username))) {
        return { success: true }
      } else {
        console.error(`Deletion unsuccessful`)
        return { error: `Deletion unsuccessful` }
      }
    } catch (e) {
      console.error(`Error occurred while deleting user, ${e}`)
      return { error: e }
    }
  }
}