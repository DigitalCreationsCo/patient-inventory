import { ObjectId } from "mongodb"

let patientsColl

export default class PatientsDAO {

  static async injectDB(conn) {
    if (patientsColl){
      return
    }
    try {
      patientsColl = await conn.db(process.env.DB_NS).collection("patients")
    } catch (e) {
      console.error(`Unable to establish collection handles in vendorDAO: ${e}`)
    }
  }

  static async getPatientsByHospital(hospital) {
    return await patientsColl.find({ hospital })
  }

  static async getPatientByName(firstName, lastName) {
    return await vendorsColl.findOne({ firstName, lastName })
  }

  static async getPatientById(patientId) {
    return await vendorsColl.findOne({ patientId: ObjectId(patientId) })
  }

  static async addPatient(patient) {
    try {
      await patientsColl.insertOne(patient, { w: "majority" })
      return { success: true }
    } catch (e) {
      if (String(e).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "A patient with this id already exists."}
      }
      console.error(`Error occurred while adding a new patient, ${e}.`)
      return { error: e }
    }
  }

  static async updatePatient(patient) {
    try {
      let {patientId, items} = patient
      
      let query = patientId
      let update = { $set: { ...patient, items  }}
      let upsert = { upsert: true }
      await patientsColl.updateOne(query, update, upsert)
      return { success: true }
    } catch (e) {
      console.error(`Error occurred while updating the patient, ${e}`)
      return { error: e }
    }
  }

  static async deletePatient(patientId) {
    try {
      await patientsColl.deleteOne({ patientId })
      if (!(await this.getPatientById(patientId))) {
        return { success: true }
      } else {
        console.error(`Deletion unsuccessful`)
        return { error: `Deletion unsuccessful` }
      }
    } catch (e) {
      console.log(`Error occurred while deleting vendor, ${e}`)
      return { error: e }
    }
  }
}