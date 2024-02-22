import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export class User {
  constructor({ 
    userId = new ObjectId, 
    username,
    email,
    password,
  }) {
    this.userId = userId
    this.username = username
    this.email = email
    this.password = password
  }
  toJson() {
    return { 
      userId: this.userId, 
      username: this.username,
      email: this.email,
      password: this.password,
      hashedPassword: this.hashedPassword,
    }
  }
  async comparePasswordNoHash(plainText) {
    try {
    return await bcrypt.compare(plainText, this.password)
    } catch (e) {
      return e
    }
  }
  async comparePassword(plainText) {
    try {
    return await bcrypt.compare(plainText, this.hashedPassword)
    } catch (e) {
      return e
    }
  }
  encoded() {
    return jwt.sign({ 
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4, 
      ...this.toJson()
      },
      process.env.USER_SECRET_KEY,
    )
  }
  static async decoded(userJwt) {
    return jwt.verify(userJwt, process.env.USER_SECRET_KEY, (error, decoded) => {
      if (error) { return { error } }
      return new User(decoded)
    })
  }
}

export default User