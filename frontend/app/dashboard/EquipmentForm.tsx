"use client";
import { useState, useEffect } from "react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Equipment {
  uniqueUserId: string;
  locationId: string;
  make: string;
  model: string;
  configuration: string;
  serial: string;
  purchaseDate: string;
  eolDate: string;
  deactivated: boolean;
  locationIdequipmentId: string;
}

interface Location {
  uniqueUserId: string;
  customerId: string;
  locationName: string;
  locationAddress: string;
  locationCity: string;
  locationState: string;
  locationZip: string;
  locationContact: string;
  locationContactEmail: string;
  locationContactPhone: string;
  deactivated: boolean;
  customerIdlocationId: string;
}

export default function EquipmentForm({ userId, customer, location }: { userId: string, customer: any, location: Location }) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [configuration, setConfiguration] = useState("");
  const [serial, setSerial] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [eolDate, setEolDate] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [changedRows, setChangedRows] = useState<Set<number>>(new Set());

  const fetchEquipment = async () => {
    const res = await axios.post('http://localhost:3001/getEquipmentByLocation', {
      uniqueUserId: userId,
      locationId: location.customerIdlocationId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setEquipment(res.data);
  };

  useEffect(() => {
    fetchEquipment();
  }, [userId, location]);

  const handleAddEquipment = async (e: any) => {
    e.preventDefault();
    const equipmentItem = {
      uniqueUserId: userId,
      locationId: location.customerIdlocationId,
      make,
      model,
      configuration,
      serial,
      purchaseDate,
      eolDate,
      deactivated: false,
      locationIdequipmentId: `${location.customerIdlocationId}|${make}|${model}|${configuration}|${serial}|${purchaseDate}|${eolDate}`
    };
    await axios.post('http://localhost:3001/addEquipment', equipmentItem, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setMake("");
    setModel("");
    setConfiguration("");
    setSerial("");
    setPurchaseDate("");
    setEolDate("");
    await fetchEquipment();
  };

  const handleSaveChanges = async () => {
    const updatedEquipment = Array.from(changedRows).map(index => equipment[index]);
    await axios.post('http://localhost:3001/updateEquipment', { equipment: updatedEquipment }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setHasChanges(false);
    setChangedRows(new Set());
    toast.success("Saved!");
    fetchEquipment();
  };

  const handleInputChange = (index: number, field: keyof Equipment, value: string) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index][field] = value;
    setEquipment(updatedEquipment);
    setHasChanges(true);
    setChangedRows(prev => new Set(prev).add(index));
  };

  const handleDeactivatedChange = (index: number, value: boolean) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index].deactivated = value;
    setEquipment(updatedEquipment);
    setHasChanges(true);
    setChangedRows(prev => new Set(prev).add(index));
  };

  return (
    <div className="space-y-4">
      <ToastContainer />
      <div className="flex justify-center mb-4">
        <div className="text-center mx-4">
          <h1 className="text-2xl font-bold text-black">Customer: {customer.name}</h1>
          <p className="text-lg text-black">{customer.address}, {customer.city}, {customer.state}, {customer.zip}</p>
          <p className="text-lg text-black">Contact: {customer.contact}</p>
          <p className="text-lg text-black">Contact Email: {customer.contactEmail}</p>
          <p className="text-lg text-black">Contact Phone: {customer.contactPhone}</p>
        </div>
        <div className="text-center mx-4">
          <h2 className="text-xl font-bold text-black">Location: {location.locationName}</h2>
          <p className="text-lg text-black">{location.locationAddress}, {location.locationCity}, {location.locationState}, {location.locationZip}</p>
          <p className="text-lg text-black">Contact: {location.locationContact}</p>
          <p className="text-lg text-black">Contact Email: {location.locationContactEmail}</p>
          <p className="text-lg text-black">Contact Phone: {location.locationContactPhone}</p>
        </div>
      </div>
      <h2 className="text-xl font-bold text-black text-center">Equipment</h2>
      <table className="w-full text-black mb-4">
        <thead>
          <tr>
            <th className="border px-4 py-2">Make</th>
            <th className="border px-4 py-2">Model</th>
            <th className="border px-4 py-2">Configuration #</th>
            <th className="border px-4 py-2">Serial #</th>
            <th className="border px-4 py-2">Purchase Date</th>
            <th className="border px-4 py-2">EOL Date</th>
            <th className="border px-4 py-2">Deactivated</th>
          </tr>
        </thead>
        <tbody>
          {equipment.length === 0 ? (
            <tr>
              <td colSpan={7} className="border px-4 py-2 text-center">No equipment</td>
            </tr>
          ) : (
            equipment.map((item, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.make}
                    onChange={(e) => handleInputChange(index, 'make', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.model}
                    onChange={(e) => handleInputChange(index, 'model', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.configuration}
                    onChange={(e) => handleInputChange(index, 'configuration', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.serial}
                    onChange={(e) => handleInputChange(index, 'serial', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="date"
                    value={item.purchaseDate}
                    onChange={(e) => handleInputChange(index, 'purchaseDate', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="date"
                    value={item.eolDate}
                    onChange={(e) => handleInputChange(index, 'eolDate', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.deactivated}
                    onChange={(e) => handleDeactivatedChange(index, e.target.checked)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex justify-center">
        <button
          onClick={handleSaveChanges}
          className={`h-20 w-64 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 mt-4 ${hasChanges ? 'flash' : ''}`}
          disabled={!hasChanges}
        >
          Save
        </button>
      </div>
      <form onSubmit={handleAddEquipment} className="grid grid-cols-1 gap-4 mt-4">
        <input name="make" placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="model" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="configuration" placeholder="Configuration #" value={configuration} onChange={(e) => setConfiguration(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="serial" placeholder="Serial #" value={serial} onChange={(e) => setSerial(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="purchaseDate" placeholder="Purchase Date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required className="p-2 border rounded w-full" type="date" />
        <input name="eolDate" placeholder="EOL Date" value={eolDate} onChange={(e) => setEolDate(e.target.value)} required className="p-2 border rounded w-full" type="date" />
        <button type="submit" className="h-10 w-48 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 mt-4 mx-auto">
          Add Equipment
        </button>
      </form>
      <button
        className="h-10 w-48 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 mt-4 mx-auto"
        onClick={() => window.location.href = "/dashboard"}
      >
        Back
      </button>
    </div>
  );
}
