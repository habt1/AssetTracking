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

app.post("/addLocation", async (req, res) => {
  const location = req.body;
  try {
    await db.addLocation(location);
    res.status(200).send('Location added successfully');
  } catch (error) {
    console.error('Error adding location:', error);
    res.status(500).send('Error adding location');
  }
});

app.post("/getLocationsByCustomer", async (req, res) => {
  const { uniqueUserId, customerId } = req.body;
  try {
    const locations = await db.getLocationsByCustomer(uniqueUserId, customerId);
    res.status(200).send(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send('Error fetching locations');
  }
});

app.post("/getEquipmentByLocation", async (req, res) => {
  const { uniqueUserId, locationId } = req.body;
  try {
    const equipment = await db.getEquipmentByLocation(uniqueUserId, locationId);
    res.status(200).send(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).send('Error fetching equipment');
  }
});

app.post("/addEquipment", async (req, res) => {
  const equipment = req.body;
  try {
    await db.addEquipment(equipment);
    res.status(200).send('Equipment added successfully');
  } catch (error) {
    console.error('Error adding equipment:', error);
    res.status(500).send('Error adding equipment');
  }
});

app.post("/updateLocations", async (req, res) => {
  const { locations } = req.body;
  try {
    await Promise.all(locations.map(location => db.updateLocation(location)));
    res.status(200).send('Locations updated successfully');
  } catch (error) {
    console.error('Error updating locations:', error);
    res.status(500).send('Error updating locations');
  }
});

app.post("/updateEquipment", async (req, res) => {
  const { equipment } = req.body;
  try {
    await Promise.all(equipment.map(item => db.updateEquipment(item)));
    res.status(200).send('Equipment updated successfully');
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).send('Error updating equipment');
  }
});

module.exports = app;
