// src/pages/api/ex101/member.tsx
import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/app/lib/db"; // แก้ไขให้ถูกต้องตามที่คุณได้ตั้งค่า

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { prefix, first_name, last_name, dob, profile_picture } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!prefix || !first_name || !last_name || !dob) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // คำนวณอายุจากวันเกิด (dob)
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ error: "Invalid date of birth" });
      }

      const currentYear = new Date().getFullYear();
      const birthYear = birthDate.getFullYear();
      let age = currentYear - birthYear;

      // ตรวจสอบอายุหากเกิดหลังวันเกิดในปีนี้
      if (
        new Date().getMonth() < birthDate.getMonth() ||
        (new Date().getMonth() === birthDate.getMonth() &&
          new Date().getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // เพิ่มข้อมูลลงฐานข้อมูล
      const result = await pool.query(
        "INSERT INTO members (prefix, first_name, last_name, dob, age, profile_picture) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [prefix, first_name, last_name, dob, age, profile_picture]
      );

      // ส่งข้อมูลที่เพิ่งบันทึกกลับ
      return res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error("Error details:", error.message);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === "GET") {
    const { search, sort } = req.query; // รับค่า query parameter สำหรับการค้นหาหรือการเรียงลำดับ

    try {
      let query = "SELECT * FROM members";
      let queryParams: any[] = [];

      // การค้นหาตามชื่อหรือ/และนามสกุล
      if (search) {
        query += ` WHERE first_name ILIKE $1 OR last_name ILIKE $1`;
        queryParams.push(`%${search}%`);
      }

      // การเรียงลำดับตามอายุ
      if (sort) {
        query += ` ORDER BY age ${sort === "asc" ? "ASC" : "DESC"}`;
      }

      // ดึงข้อมูลจากฐานข้อมูล
      const result = await pool.query(query, queryParams);

      // ส่งข้อมูลทั้งหมดกลับ
      return res.status(200).json(result.rows);
    } catch (error: any) {
      console.error("Error details:", error.message);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query; // รับค่าจาก query ที่เป็น id ของสมาชิก

    if (!id) {
      return res.status(400).json({ error: "Missing member ID" });
    }

    try {
      // ลบสมาชิกจากฐานข้อมูลโดยใช้ id
      const result = await pool.query(
        "DELETE FROM members WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Member not found" });
      }

      // ส่งข้อมูลที่เพิ่งลบกลับ
      return res.status(200).json({ message: "Member deleted successfully" });
    } catch (error: any) {
      console.error("Error details:", error.message);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === "PATCH") {
    const { id, prefix, first_name, last_name, dob, profile_picture } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!id) {
      return res.status(400).json({ error: "Missing member ID" });
    }

    try {
      let query = "UPDATE members SET";
      let queryParams: any[] = [];
      let setStatements: string[] = [];

      // ตรวจสอบค่าที่ต้องการอัพเดต
      if (prefix) {
        setStatements.push("prefix = $" + (queryParams.length + 1));
        queryParams.push(prefix);
      }
      if (first_name) {
        setStatements.push("first_name = $" + (queryParams.length + 1));
        queryParams.push(first_name);
      }
      if (last_name) {
        setStatements.push("last_name = $" + (queryParams.length + 1));
        queryParams.push(last_name);
      }
      if (dob) {
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) {
          return res.status(400).json({ error: "Invalid date of birth" });
        }

        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        let age = currentYear - birthYear;

        // ตรวจสอบอายุหากเกิดหลังวันเกิดในปีนี้
        if (
          new Date().getMonth() < birthDate.getMonth() ||
          (new Date().getMonth() === birthDate.getMonth() &&
            new Date().getDate() < birthDate.getDate())
        ) {
          age--;
        }

        setStatements.push("dob = $"+ (queryParams.length + 1));
        queryParams.push(dob);
        setStatements.push("age = $" + (queryParams.length + 1));
        queryParams.push(age);
      }
      if (profile_picture) {
        setStatements.push("profile_picture = $" + (queryParams.length + 1));
        queryParams.push(profile_picture);
      }

      if (setStatements.length === 0) {
        return res.status(400).json({ error: "No data to update" });
      }

      // สร้างคำสั่ง SQL และเพิ่มเงื่อนไข WHERE
      query += " " + setStatements.join(", ") + " WHERE id = $" + (queryParams.length + 1);
      queryParams.push(id);

      // อัพเดตข้อมูลในฐานข้อมูล
      const result = await pool.query(query, queryParams);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Member not found" });
      }

      // ส่งข้อมูลที่อัพเดตกลับ
      return res.status(200).json(result.rows[0]);
    } catch (error: any) {
      console.error("Error details:", error.message);
      return res.status(500).json({ error: error.message });
    }
  } else {
    // หากไม่ใช่ POST, GET, DELETE หรือ PATCH
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
