const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 3333;

const cors = require("cors");
app.use(cors());

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
app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ↓で、http://localhost/customer/detail.html?customerId=1 みたいにID指定が効くようになった
app.get("/customers/:id", async (req, res) => {
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

app.delete("/customers/:id", async (req, res) => {
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
  console.log('Received form data:', req.body);
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


// 顧客情報更新のエンドポイント
app.post('/update-customer/:id', async (req, res) => {
  const customerId = req.params.id;

  try {
    // 顧客が存在するか確認
    const customerCheck = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [customerId]);

    if (customerCheck.rows.length === 0) {
      // 顧客が存在しない場合、404エラーを返す
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    // フォームデータから更新情報を取得
    const { companyName, industry, contact, location } = req.body;

    // 顧客情報を更新
    await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, contact = $3, location = $4 WHERE customer_id = $5",
      [companyName, industry, contact, location, customerId]
    );

    // 更新成功時、成功メッセージを返す
    res.json({ success: true, message: "Customer updated successfully" });
  } catch (err) {
    // エラーが発生した場合、500エラーを返す
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use(express.static("public"));