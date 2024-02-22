import app from "./server";
import { MongoClient } from "mongodb"
import UsersDAO from "./data-access/usersDAO";
import PatientsDAO from "./data-access/patientsDAO";

const uri = process.env.DB_URI
const port = process.env.PORT || 8000

MongoClient.connect(uri, {
  useNewUrlParser: true, useUnifiedTopology: true
})
.catch(err => {
  console.error(err.stack)
  process.exit(1)
})
.then(async client => {
  await UsersDAO.injectDB(client)
  await PatientsDAO.injectDB(client)
  console.log("  👏 MongoDB connected");
  
  app.listen(port, () => {
  console.log(`  🚀 Patient Inventory App Server launching on port ${port}`);
})
})

