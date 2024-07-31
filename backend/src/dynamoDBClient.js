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

const getAllCustomers = async (uniqueUserId) => {
  console.log("Unique User ID: ", uniqueUserId);
  const params = {
    TableName: 'CustomerTable',
    Item: {
      uniqueUserId: uniqueUserId
    }
  };

  try {
    const data = await docClient.scan(params).promise();
    return data.Items;
  } catch (err) {
    console.error('Unable to fetch customers. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const getAllSerials = async (uniqueUserId) => {
  console.log("Unique User ID: ", uniqueUserId);
  const params = {
    TableName: 'EquipmentTable',
    Item: {
      uniqueUserId: uniqueUserId
    }
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

const getEquipmentBySerial = async (uniqueUserId, serial) => {
  const params = {
    TableName: 'EquipmentTable',
    FilterExpression: 'uniqueUserId = :uid AND serial = :serial',
    ExpressionAttributeValues: {
      ':uid': uniqueUserId,
      ':serial': serial,
    }
  };

  try {
    const data = await docClient.scan(params).promise();
    if (data.Items.length === 0) {
      throw new Error('Equipment not found');
    }
    return data.Items[0];
  } catch (err) {
    console.error('Unable to fetch equipment by serial. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const getLocationById = async (uniqueUserId, locationId) => {
  const params = {
    TableName: 'LocationTable',
    KeyConditionExpression: 'uniqueUserId = :uid AND customerIdlocationId = :lid',
    ExpressionAttributeValues: {
      ':uid': uniqueUserId,
      ':lid': locationId
    }
  };

  try {
    const data = await docClient.query(params).promise();
    if (data.Items.length === 0) {
      throw new Error('Location not found');
    }
    return data.Items[0];
  } catch (err) {
    console.error('Unable to fetch location. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const getCustomerById = async (uniqueUserId, customerId) => {
  const params = {
    TableName: 'CustomerTable',
    KeyConditionExpression: 'uniqueUserId = :uid AND customerId = :cid',
    ExpressionAttributeValues: {
      ':uid': uniqueUserId,
      ':cid': customerId
    }
  };

  try {
    const data = await docClient.query(params).promise();
    if (data.Items.length === 0) {
      throw new Error('Customer not found');
    }
    return data.Items[0];
  } catch (err) {
    console.error('Unable to fetch customer. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const getServicesByEquipment = async (uniqueUserId, equipmentId) => {
  const params = {
    TableName: 'ServiceTable',
    KeyConditionExpression: 'uniqueUserId = :uid AND begins_with(equipmentIdserviceId, :eid)',
    ExpressionAttributeValues: {
      ':uid': uniqueUserId,
      ':eid': equipmentId + '|'
    }
  };

  try {
    const data = await docClient.query(params).promise();
    return data.Items;
  } catch (err) {
    console.error('Unable to fetch services. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const addService = async (service) => {
  const params = {
    TableName: 'ServiceTable',
    Item: {
      uniqueUserId: service.uniqueUserId,
      equipmentIdserviceId: service.equipmentIdserviceId,
      ...service  // Include all service fields in the Item
    }
  };

  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.error('Unable to add service. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const updateService = async (service) => {
  const params = {
    TableName: 'ServiceTable',
    Key: {
      uniqueUserId: service.uniqueUserId,
      equipmentIdserviceId: service.equipmentIdserviceId,
    },
    UpdateExpression: `set 
      serviceDateIn = :serviceDateIn,
      equipmentId = :equipmentId,
      rma = :rma,
      orderNum = :orderNum,
      po = :po,
      technician = :technician,
      issue = :issue,
      serviceDateReceived = :serviceDateReceived,
      returnDate = :returnDate,
      shipMethod = :shipMethod,
      tracking = :tracking,
      deactivated = :deactivated`,
    ExpressionAttributeValues: {
      ':serviceDateIn': service.serviceDateIn,
      ':equipmentId': service.equipmentId,
      ':rma': service.rma,
      ':orderNum': service.orderNum,
      ':po': service.po,
      ':technician': service.technician,
      ':issue': service.issue,
      ':serviceDateReceived': service.serviceDateReceived,
      ':returnDate': service.returnDate,
      ':shipMethod': service.shipMethod,
      ':tracking': service.tracking,
      ':deactivated': service.deactivated,
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await docClient.update(params).promise();
  } catch (err) {
    console.error('Unable to update service. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const getContractsByEquipment = async (uniqueUserId, equipmentId) => {
  const params = {
    TableName: 'ContractTable',
    KeyConditionExpression: 'uniqueUserId = :uid AND begins_with(equipmentIdcontractId, :eid)',
    ExpressionAttributeValues: {
      ':uid': uniqueUserId,
      ':eid': equipmentId + '|'
    }
  };

  try {
    const data = await docClient.query(params).promise();
    return data.Items;
  } catch (err) {
    console.error('Unable to fetch contracts. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const addContract = async (contract) => {
  const params = {
    TableName: 'ContractTable',
    Item: {
      uniqueUserId: contract.uniqueUserId,
      equipmentIdcontractId: contract.equipmentIdcontractId,
      ...contract  // Include all contract fields in the Item
    }
  };

  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.error('Unable to add contract. Error JSON:', JSON.stringify(err, null, 2));
  }
};

const updateContract = async (contract) => {
  const params = {
    TableName: 'ContractTable',
    Key: {
      uniqueUserId: contract.uniqueUserId,
      equipmentIdcontractId: contract.equipmentIdcontractId,
    },
    UpdateExpression: `set 
      po = :po,
      orderNum = :orderNum,
      technician = :technician,
      term = :term,
      startDate = :startDate,
      deactivated = :deactivated`,
    ExpressionAttributeValues: {
      ':po': contract.po,
      ':orderNum': contract.orderNum,
      ':technician': contract.technician,
      ':term': contract.term,
      ':startDate': contract.startDate,
      ':deactivated': contract.deactivated,
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await docClient.update(params).promise();
  } catch (err) {
    console.error('Unable to update contract. Error JSON:', JSON.stringify(err, null, 2));
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
  updateEquipment,
  getEquipmentBySerial,
  getLocationById,
  getCustomerById,
  getServicesByEquipment,
  addService,
  updateService,
  getContractsByEquipment,
  addContract,
  updateContract
};
