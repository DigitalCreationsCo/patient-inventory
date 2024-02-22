import { Router } from "express"
import patientsCtrl from "../controllers/patients.controller"
const router = new Router()

/*====================
  Patient API Routes
====================*/

router.route("/getPatients").post(patientsCtrl.getPatientsByHospital)
router.route("/getPatient").get(patientsCtrl.getPatient)
router.route("/update").post(patientsCtrl.updatePatient)
router.route("/delete").delete(patientsCtrl.deletePatient)

export default router