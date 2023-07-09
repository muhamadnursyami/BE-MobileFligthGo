// Berisi konfigurasi untuk setting database pada Railway
import { Sequelize } from "sequelize";
const db = new Sequelize("railway", "root", "VpPGmZXBwTFO3J3CB28x", {
  host: "containers-us-west-84.railway.app",
  port: "6709",
  dialect: "mysql",
});
export default db;
