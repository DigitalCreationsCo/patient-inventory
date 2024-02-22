import { Router } from "express"
import usersCtrl from "../controllers/users.controller"
const router = new Router()

/*====================
  User API Routes
  ====================*/
router.route("/hello").get((req, res) => {res.json("hello")})

router.route("/register").post(usersCtrl.register)
router.route("/login").post(usersCtrl.login)
router.route("/logout").post(usersCtrl.logout)
router.route("/delete").delete(usersCtrl.delete)
router.route("/save").patch(usersCtrl.save)

export default router