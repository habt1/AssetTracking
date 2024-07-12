import React, { useState, ChangeEvent } from 'react';

export default function EquipmentForm() {
  const [equipment, setEquipment] = useState({
    make: '',
    model: '',
    configNumber: '',
    serialNumber: '',
    purchaseDate: '',
    endOfLifeDate: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    deactivated: false
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setEquipment((prevEquipment) => ({
      ...prevEquipment,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    console.log(equipment);
    // Add code to save data
  };

  return (
    <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg w-full">
      <h1 className="mb-6 text-2xl font-bold text-red-600">Equipment Information</h1>
      <div className="grid grid-cols-2 gap-4 w-full mb-4">
        <input
          type="text"
          name="make"
          value={equipment.make}
          onChange={handleInputChange}
          placeholder="Make"
          className="p-2 border rounded text-black"
        />
        <input
          type="text"
          name="model"
          value={equipment.model}
          onChange={handleInputChange}
          placeholder="Model"
          className="p-2 border rounded text-black"
        />
        <input
          type="text"
          name="configNumber"
          value={equipment.configNumber}
          onChange={handleInputChange}
          placeholder="Config #"
          className="p-2 border rounded text-black"
        />
        <input
          type="text"
          name="serialNumber"
          value={equipment.serialNumber}
          onChange={handleInputChange}
          placeholder="Serial #"
          className="p-2 border rounded text-black"
        />
        <div className="flex flex-col">
          <label className="text-black mb-1">Purchase Date</label>
          <input
            type="date"
            name="purchaseDate"
            value={equipment.purchaseDate}
            onChange={handleInputChange}
            className="p-2 border rounded text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-black mb-1">End of Life Date</label>
          <input
            type="date"
            name="endOfLifeDate"
            value={equipment.endOfLifeDate}
            onChange={handleInputChange}
            className="p-2 border rounded text-black"
          />
        </div>
        <input
          type="text"
          name="address"
          value={equipment.address}
          onChange={handleInputChange}
          placeholder="Address"
          className="p-2 border rounded col-span-2 text-black"
        />
        <input
          type="text"
          name="city"
          value={equipment.city}
          onChange={handleInputChange}
          placeholder="City"
          className="p-2 border rounded text-black"
        />
        <input
          type="text"
          name="state"
          value={equipment.state}
          onChange={handleInputChange}
          placeholder="State"
          className="p-2 border rounded text-black"
        />
        <input
          type="text"
          name="zip"
          value={equipment.zip}
          onChange={handleInputChange}
          placeholder="Zip Code"
          className="p-2 border rounded text-black"
          pattern="[0-9]{5}"
          title="Zip code format: 12345"
        />
        <label className="col-span-2 flex items-center text-black">
          <input
            type="checkbox"
            name="deactivated"
            checked={equipment.deactivated}
            onChange={handleInputChange}
            className="mr-2"
          />
          Deactivated
        </label>
      </div>
      <button
        className="h-10 w-32 rounded-lg bg-red-600 text-black font-semibold hover:bg-red-700"
        onClick={handleSubmit}
      >
        Add Device
      </button>
    </div>
  );
}
