import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import users from "./api/routes/users.route"
import patients from "./api/routes/patients.route"

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use("/api/user", users)
app.use("/api/patient", patients)
app.use("*", (req, res) => res.status(404).json({ error: "API not found" }))

export default app