const express = require('express');
const cors = require('cors');
const db = require('./dynamoDBClient');
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/addUser", async (req, res) => {
  const { id, name, email } = req.body;
  if (!id) {
    return res.status(400).send('userId is required');
  }

  try {
    await db.addUser({ id, name, email });
    res.status(200).send('User added successfully');
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('Error adding user');
  }
});

app.get("/getAllCustomers", async (req, res) => {
  try {
    const customers = await db.getAllCustomers();
    res.status(200).send(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).send('Error fetching customers');
  }
});

app.get("/getAllSerials", async (req, res) => {
  try {
    const serials = await db.getAllSerials();
    res.status(200).send(serials);
  } catch (error) {
    console.error('Error fetching serials:', error);
    res.status(500).send('Error fetching serials');
  }
});

app.post("/addCustomer", async (req, res) => {
  const customer = req.body;
  try {
    await db.addCustomer(customer);
    res.status(200).send('Customer added successfully');
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).send('Error adding customer');
  }
});

module.exports = app;
