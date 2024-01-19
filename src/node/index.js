const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 3333;

const cors = require("cors");
app.use(cors());

// 一覧画面表紙のために追加
const helmet = require('helmet');
app.use(helmet());

const { Pool } = require("pg");
// Staging環境でDBに繋げられるようにこの↓情報を変更する必要がある。15kmで書いてある内容に変更。
const pool = new Pool({
  user: "user_minami_ito", // PostgreSQLのユーザー名に置き換えてください
  host: "localhost", //"host"ってなってたのを変更
  database: "db_minami_ito", // PostgreSQLのデータベース名に置き換えてください
  password: "pass", // PostgreSQLのパスワードに置き換えてください
  port: 5432,
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ↓"/customers"ってなってたのを変更　関係ないかも
app.get("/customer", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

// ↓で、http://localhost/customer/detail.html?customerId=1 みたいにID指定が効くようになった
app.get("/customer/:id", async (req, res) => {
  const customerId = req.params.id;
  try {
    const customerData = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [customerId]);
    if (customerData.rows.length === 0) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.json(customerData.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/customer/:id", async (req, res) => {
  const customerId = req.params.id;

  try {
    // 顧客が存在するか確認
    const customerCheck = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [customerId]);

    if (customerCheck.rows.length === 0) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    // 顧客を削除
    await pool.query("DELETE FROM customers WHERE customer_id = $1", [customerId]);

    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/add-customer", async (req, res) => {
  try {
    const { companyName, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [companyName, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.use(express.static("public"));