import { Pool } from "pg";

// สร้างการเชื่อมต่อกับฐานข้อมูล
const pool = new Pool({
  user: "postgres",       // ชื่อผู้ใช้ฐานข้อมูล
  host: "localhost",      // ที่อยู่ของเซิร์ฟเวอร์ฐานข้อมูล
  database: "income_management", // ชื่อฐานข้อมูล
  password: "korn",       // รหัสผ่านฐานข้อมูล
  port: 5432,             // พอร์ตที่ใช้เชื่อมต่อ (PostgreSQL ใช้ 5432 โดยปกติ)
});

// ทดสอบการเชื่อมต่อฐานข้อมูล
pool.connect()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection error", err.stack);
  });

export default pool;
