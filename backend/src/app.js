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

app.post("/getAllCustomers", async (req, res) => {
  const uniqueUserId = req.body;
  try {
    const customers = await db.getAllCustomers(uniqueUserId);
    res.status(200).send(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).send('Error fetching customers');
  }
});

app.post("/getAllSerials", async (req, res) => {
  const uniqueUserId = req.body;
  try {
    const serials = await db.getAllSerials(uniqueUserId);
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

app.post("/updateCustomer", async (req, res) => {
  const { uniqueUserId, customerId, updates } = req.body;
  try {
    await db.updateCustomer(uniqueUserId, customerId, updates);
    res.status(200).send('Customer updated successfully');
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).send('Error updating customer');
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

app.post("/updateService", async (req, res) => {
  const { service } = req.body;
  try {
    await Promise.all(service.map(item => db.updateService(item)));
    res.status(200).send('Service updated successfully');
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).send('Error updating service');
  }
});

app.post("/getEquipmentBySerial", async (req, res) => {
  const { uniqueUserId, serial } = req.body;
  try {
    const equipment = await db.getEquipmentBySerial(uniqueUserId, serial);
    const locationId = equipment.locationId;
    const location = await db.getLocationById(uniqueUserId, locationId);
    const customerId = location.customerId;
    const customer = await db.getCustomerById(uniqueUserId, customerId);

    res.status(200).send({ equipment, location, customer });
  } catch (error) {
    console.error('Error fetching equipment by serial:', error);
    res.status(500).send('Error fetching equipment by serial');
  }
});

app.post("/getServicesByEquipment", async (req, res) => {
  const { uniqueUserId, equipmentId } = req.body;
  try {
    const services = await db.getServicesByEquipment(uniqueUserId, equipmentId);
    res.status(200).send(services);
  } catch (error) {
    console.error('Error fetching services by equipment:', error);
    res.status(500).send('Error fetching services by equipment');
  }
});

app.post("/addService", async (req, res) => {
  const service = req.body;
  try {
    await db.addService(service);
    res.status(200).send('Service added successfully');
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).send('Error adding service');
  }
});

app.post("/getContractByEquipment", async (req, res) => {
  const { uniqueUserId, equipmentId } = req.body;
  try {
    const contract = await db.getContractByEquipment(uniqueUserId, equipmentId);
    res.status(200).send(contract);
  } catch (error) {
    console.error('Error fetching contract by equipment:', error);
    res.status(500).send('Error fetching contract by equipment');
  }
});

app.post("/addContract", async (req, res) => {
  const contract = req.body;
  try {
    await db.addContract(contract);
    res.status(200).send('Contract added successfully');
  } catch (error) {
    console.error('Error adding contract:', error);
    res.status(500).send('Error adding contract');
  }
});

app.post("/updateContract", async (req, res) => {
  const { contracts } = req.body;
  try {
    await Promise.all(contracts.map(contract => db.updateContract(contract)));
    res.status(200).send('Contracts updated successfully');
  } catch (error) {
    console.error('Error updating contracts:', error);
    res.status(500).send('Error updating contracts');
  }
});

app.post("/deleteContractByEquipment", async (req, res) => {
  const { uniqueUserId, equipmentId } = req.body;
  try {
    await db.deleteContractByEquipment(uniqueUserId, equipmentId);
    res.status(200).send('Contract deleted successfully');
  } catch (error) {
    console.error('Error deleting contract by equipment:', error);
    res.status(500).send('Error deleting contract by equipment');
  }
});

module.exports = app;
