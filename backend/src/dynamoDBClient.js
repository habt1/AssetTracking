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
    return data.Items;
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
    return data.Items.map(item => item.serial);
  } catch (err) {
    console.error('Unable to fetch serials. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const addCustomer = async (customer) => {
  const customerId = [
    customer.name, customer.address, customer.city,
    customer.state, customer.zip, customer.contact,
    customer.contactEmail, customer.contactPhone
  ].join('|');

  const params = {
    TableName: 'CustomerTable',
    Item: {
      uniqueUserId: customer.uniqueUserId,
      customerId: customerId,
      ...customer  // Include all customer fields in the Item
    }
  };

  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.error('Unable to add customer. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const addLocation = async (location) => {
  const customerId = location.customerId;

  const locationId = [
    location.locationName, location.locationAddress, location.locationCity,
    location.locationState, location.locationZip, location.locationContact,
    location.locationContactEmail, location.locationContactPhone
  ].join('|');

  const params = {
    TableName: 'LocationTable',
    Item: {
      uniqueUserId: location.uniqueUserId,
      customerIdlocationId: `${customerId}|${locationId}`,
      ...location  // Include all location fields in the Item
    }
  };

  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.error('Unable to add location. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const getLocationsByCustomer = async (uniqueUserId, customerId) => {
  const params = {
    TableName: 'LocationTable',
    KeyConditionExpression: 'uniqueUserId = :uid AND begins_with(customerIdlocationId, :cid)',
    ExpressionAttributeValues: {
      ':uid': uniqueUserId,
      ':cid': customerId + '|'
    }
  };

  try {
    const data = await docClient.query(params).promise();
    return data.Items;
  } catch (err) {
    console.error('Unable to fetch locations. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const getEquipmentByLocation = async (uniqueUserId, locationId) => {
  const params = {
    TableName: 'EquipmentTable',
    KeyConditionExpression: 'uniqueUserId = :uid AND begins_with(locationIdequipmentId, :lid)',
    ExpressionAttributeValues: {
      ':uid': uniqueUserId,
      ':lid': locationId + '|'
    }
  };

  try {
    const data = await docClient.query(params).promise();
    return data.Items;
  } catch (err) {
    console.error('Unable to fetch equipment. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const addEquipment = async (equipment) => {
  const locationId = equipment.locationId;

  const equipmentId = [
    equipment.make, equipment.model, equipment.configuration,
    equipment.serial, equipment.purchaseDate, equipment.eolDate,
    equipment.deactivated
  ].join('|');

  const params = {
    TableName: 'EquipmentTable',
    Item: {
      uniqueUserId: equipment.uniqueUserId,
      locationIdequipmentId: `${locationId}|${equipmentId}`,
      ...equipment  // Include all equipment fields in the Item
    }
  };

  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.error('Unable to add equipment. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const updateLocation = async (location) => {
  const params = {
    TableName: 'LocationTable',
    Key: {
      uniqueUserId: location.uniqueUserId,
      customerIdlocationId: location.customerIdlocationId,
    },
    UpdateExpression: `set 
      locationName = :locationName,
      locationAddress = :locationAddress,
      locationCity = :locationCity,
      locationState = :locationState,
      locationZip = :locationZip,
      locationContact = :locationContact,
      locationContactEmail = :locationContactEmail,
      locationContactPhone = :locationContactPhone,
      deactivated = :deactivated`,
    ExpressionAttributeValues: {
      ':locationName': location.locationName,
      ':locationAddress': location.locationAddress,
      ':locationCity': location.locationCity,
      ':locationState': location.locationState,
      ':locationZip': location.locationZip,
      ':locationContact': location.locationContact,
      ':locationContactEmail': location.locationContactEmail,
      ':locationContactPhone': location.locationContactPhone,
      ':deactivated': location.deactivated,
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await docClient.update(params).promise();
  } catch (err) {
    console.error('Unable to update location. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const updateEquipment = async (equipment) => {
  const params = {
    TableName: 'EquipmentTable',
    Key: {
      uniqueUserId: equipment.uniqueUserId,
      locationIdequipmentId: equipment.locationIdequipmentId,
    },
    UpdateExpression: `set 
      make = :make,
      model = :model,
      configuration = :configuration,
      serial = :serial,
      purchaseDate = :purchaseDate,
      eolDate = :eolDate,
      deactivated = :deactivated`,
    ExpressionAttributeValues: {
      ':make': equipment.make,
      ':model': equipment.model,
      ':configuration': equipment.configuration,
      ':serial': equipment.serial,
      ':purchaseDate': equipment.purchaseDate,
      ':eolDate': equipment.eolDate,
      ':deactivated': equipment.deactivated,
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await docClient.update(params).promise();
  } catch (err) {
    console.error('Unable to update equipment. Error JSON:', JSON.stringify(err, null, 2));
  }
};

module.exports = {
  addUser,
  getAllCustomers,
  getAllSerials,
  addCustomer,
  addLocation,
  getLocationsByCustomer,
  getEquipmentByLocation,
  addEquipment,
  updateLocation,
  updateEquipment
};
