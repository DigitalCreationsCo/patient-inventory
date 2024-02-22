import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export class Patient {
  constructor({
    patientId = new ObjectId(),
    firstName,
    lastName,
    dob,
    hospital,
    floor,
    room,
    items = [],
  }) {
    this.patientId = patientId
    this.firstName = firstName
    this.lastName = lastName
    this.dob = dob
    this.hospital = hospital
    this.floor = floor
    this.room = room
    this.items = items
  }
  toJson() {
    return {
      patientId: this.patientId,
      firstName: this.firstName, 
      lastName: this.lastName,
      dob: this.dob, 
      hospital: this.hospital,
      floor: this.floor, 
      room: this.room, 
      items: this.items,
    }
  }
  async comparePassword(plainText) {
    try {
    return await bcrypt.compare(plainText, this.password)
    } catch (e) {
      return e
    }
  }
  encoded() {
    return jwt.sign({ 
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
      ...this.toJson()
      },
      process.env.PATIENT_SECRET_KEY,
    )
  }
  static async decoded(patientJwt) {
    return jwt.verify(patientJwt, process.env.PATIENT_SECRET_KEY, (error, decoded) => {
      if (error) { return { error } }
      return new Patient(decoded)
    })
  }
}

export default Patient