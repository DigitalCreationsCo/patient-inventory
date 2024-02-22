import bcrypt from "bcryptjs"
import Patient from "../models/Patient"
import PatientsDAO from "../../data-access/patientsDAO"

const hashPassword = async password => await bcrypt.hash(password, 10)

export default class PatientController {

  static async getPatientsByHospital(req, res) {
    try {
      const hospital = req.body
      let patients = await PatientsDAO.getPatientsByHospital(hospital)
      if (!patients) {
        return res.status(404).json({ error: "Patients not found."})
      }
      res.json(patients)
    } catch (e) {
      console.log(e)
      res.status(500).json({ error: e})
    }
  }

  static async getPatient(req, res) {
    try {
      const patientId = req.params.id || {}
      let patient = await PatientsDAO.getPatientById(patientId)
      if (!patient) {
        return res.status(404).json({ error: "Patient not found."})
      }
      res.json(patient)
    } catch (e) {
      console.log(e)
      res.status(500).json({ error: e})
    }
  }

  static async updatePatient(req, res) {
    try {
      const patientFromBody = req.body
      let errors = {}
      if (patientFromBody) {
        if ((!patientFromBody.firstName)) {
          errors.firstName = "Patient's first name is required."
        }
        if ((!patientFromBody.lastName)) {
          errors.lastName = "Patient's last name is required."
        }
        if (!patientFromBody.dob) {
          errors.dob = "Patient's date of birth is required."
        }
        if (!patientFromBody.hospital) {
          errors.hospital = "Patient's hospital is required."
        }
        if (!patientFromBody.floor) {
          errors.floor = "Patient's floor is required."
        }
        if (!patientFromBody.room) {
          errors.room = "Patient's room is required."
        }
        if ((!patientFromBody.items) || (patientFromBody.items.length < 1)) {
          errors.items = "Patient requires at least one item."
        }
      }
      const patient = new Patient(patientFromBody)
      const updatePatient = await PatientsDAO.updatePatient(patient)
      if (!updatePatient.success) {
        errors.updatePatient = updatePatient.error
      }
      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }
      res.json("The patient list has been successfully updated.")
    } catch (e) {
      console.log(e)
      res.status(500).json({ error: e})
    }
  }

  static async deletePatient(req, res) {
    try {
      const { patientId, firstName, lastName } = req.body
      //check the submitted patient name against the patient in the db
      checkPatientName = await PatientsDAO.getPatientByName(firstName, lastName)
      if (checkPatientName) {
        const deletePatient = await PatientsDAO.deletePatient(patientId)
        res.json(`Patient ${firstName} ${lastName} is successfully deleted.`)
      }
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e})
    }
  }
}