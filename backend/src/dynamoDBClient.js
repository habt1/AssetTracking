const AWS = require('aws-sdk');
const { awsConfig } = require('./awsConfig');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

const addUser = async ({ id, name, email }) => {
  const params = {
    TableName: 'UserTable',
    Item: {
      uniqueUserId: id,
      name: name,
      email: email,
    }
  };

  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.error('Unable to add user. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const getAllCustomers = async () => {
  const params = {
    TableName: 'CustomerTable',
  };

  try {
    const data = await docClient.scan(params).promise();
    return data.Items.map(item => item.customerId);
  } catch (err) {
    console.error('Unable to fetch customers. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const getAllSerials = async () => {
  const params = {
    TableName: 'EquipmentTable',
  };

  try {
    const data = await docClient.scan(params).promise();
    return data.Items.map(item => item.serialNumber);
  } catch (err) {
    console.error('Unable to fetch serials. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const addCustomer = async (customer) => {
  const params = {
    TableName: 'CustomerTable',
    Item: {
      uniqueUserId: customer.uniqueUserId,
      customerId: customer.name,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
      contact: customer.contact,
      contactEmail: customer.contactEmail,
      contactPhone: customer.contactPhone,
    }
  };

  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.error('Unable to add customer. Error JSON:', JSON.stringify(err, null, 2));
  }
};

module.exports = {
  addUser,
  getAllCustomers,
  getAllSerials,
  addCustomer
};
