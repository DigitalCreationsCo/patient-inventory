import bcrypt from "bcryptjs"
import User from "../models/User"
import UsersDAO from "../../data-access/usersDAO"

const hashPassword = async password => await bcrypt.hash(password, 10)

export default class UserController {

  static async register(req, res) {
      const { username, email, password } = req.body

      if (username, email, password){
        const user = new User({
          username,
          email,
          password: await hashPassword(password),
        })

        await UsersDAO.addUser(user)
        .then(ok => {
          res.json({
            auth_token: user.encoded(),
            info: user.toJson(),
          })
        })
        .catch(error => {
          console.error(error)
          if (String(error).includes("index: username dup key")) {
            res.status(400).json({ message: "This username already exists in our records." })

          } else if (String(error).includes("index: email dup key")) {
            res.status(400).json({ message: "This email already exists in our records." })
          }
        })
      }
      
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body
      if (!username || typeof username !== "string") {
        res.status(400).json({ error: "Bad username format, expected string." })
        return
      }
      if (!password || typeof password !== "string") {
        res.status(400).json({ error: "Bad password format, expected string." })
        return
      }
      const userData = await UsersDAO.getUserByUsername(username)
      if (!userData) {
        res.status(401).json({ error: "Please check your username." })
        return
      }
      console.log('password: ', password)
      console.log('password from db: ', userData.password)
      const user = new User(userData)

      if (!await user.comparePassword(password)) {
        res.status(401).json({ error: "Incorrect password." })
        return
      }
      const loginResponse = await UsersDAO.loginUser(user, user.encoded())
      if (!loginResponse.success) {
        res.status(500).json({ error: loginResponse.error })
        return
      }
      res.json({ 
        auth_token: user.encoded(), 
        user: user.toJson() 
      })
    } catch (e) {
      res.status(400).json({ error: e })
      return
    }
  }

  static async logout(req, res) {
    try {
      const userJwt = req.get("Authorization").slice("Bearer ".length)
      const userObj = await User.decoded(userJwt)
      var { error } = userObj
      if (error) {
        res.status(401).json({ error })
        return
      }
      const logoutResult = await UsersDAO.logoutUser(userObj.username)
      var { error } = logoutResult
      if (error) {
        res.status(500).json({ error })
        return
      }
      res.json(logoutResult)
    } catch (e) {
      res.status(500).json(e)
    }
  }

  static async delete(req, res) {
    try {
      let { password } = req.body
      if (!password || typeof password !== "string") {
        res.status(400).json({ error: "Bad password format, expected string." })
        return
      }
      const userJwt = req.get("Authorization").slice("Bearer ".length)
      const userClaim = await User.decoded(userJwt)
      var { error } = userClaim
      if (error) {
        res.status(401).json({ error })
        return
      }
      const user = new User(await UsersDAO.getUserById(userClaim.userId))
      if (!(await user.comparePassword(password))) {
        res.status(401).json({ error: "Make sure your password is correct." })
        return
      }
      const deleteResult = await UsersDAO.deleteUser(user.username)
      var { error } = deleteResult
      if (error) {
        res.status(500).json({ error })
        return
      }
      res.json(deleteResult)
    } catch (e) {
      res.status(500).json(e)
    }
  }

  static async save(req, res) {
    try {
      const userJwt = req.get("Authorization").slice("Bearer ".length)
      const userFromHeader = await User.decoded(userJwt)
      var { error } = userFromHeader
      if (error) {
        res.status(401).json({ error })
        return
      }

      await UsersDAO.updatePreferences(
        userFromHeader.email,
        req.body.preferences,
      )
      const userFromDB = await UsersDAO.getUserByEmail(userFromHeader.email)
      const updatedUser = new User(userFromDB)

      res.json({
        auth_token: updatedUser.encoded(),
        info: updatedUser.toJson(),
      })
    } catch (e) {
      res.status(500).json(e)
    }
  }
}
