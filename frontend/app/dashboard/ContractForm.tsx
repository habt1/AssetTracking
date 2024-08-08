"use client";
import { useState, useEffect } from "react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EquipmentForm from "./EquipmentForm";

interface Contract {
  uniqueUserId: string;
  equipmentId: string;
  po: string;
  orderNum: string;
  technician: string;
  term: number;
  startDate: string;
  endDate: string;
  reminder30Day: string;
  reminder10Day: string;
  equipmentIdcontractId: string;
  deactivated: boolean;
}

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

interface Customer {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contact: string;
  contactEmail: string;
  contactPhone: string;
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

export default function ContractForm({ userId, equipment, location, customer }: { userId: string, equipment: Equipment, location: Location, customer: Customer }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [po, setPo] = useState("");
  const [orderNum, setOrderNum] = useState("");
  const [technician, setTechnician] = useState("");
  const [term, setTerm] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [changedRows, setChangedRows] = useState<Set<number>>(new Set());
  const [backToEquipment, setBackToEquipment] = useState(false);

  const fetchContracts = async () => {
    const res = await axios.post('http://localhost:3001/getContractsByEquipment', {
      uniqueUserId: userId,
      equipmentId: equipment.locationIdequipmentId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const contractsWithEndDate = res.data.map((contract: Contract) => ({
      ...contract,
      endDate: calculateEndDate(contract.startDate, contract.term),
      reminder30Day: calculateReminderDate(contract.startDate, contract.term, 30),
      reminder10Day: calculateReminderDate(contract.startDate, contract.term, 10)
    }));
    setContracts(contractsWithEndDate);
  };

  useEffect(() => {
    fetchContracts();
  }, [userId, equipment]);

  const handleAddContract = async (e: any) => {
    e.preventDefault();
    const endDate = calculateEndDate(startDate, term);
    const reminder30Day = calculateReminderDate(startDate, term, 30);
    const reminder10Day = calculateReminderDate(startDate, term, 10);
    const contractItem = {
      uniqueUserId: userId,
      equipmentId: equipment.locationIdequipmentId,
      po,
      orderNum,
      technician,
      term,
      startDate,
      endDate,
      reminder30Day,
      reminder10Day,
      deactivated: false,
      equipmentIdcontractId: `${equipment.locationIdequipmentId}|${po}|${orderNum}|${technician}|${term}|${startDate}`
    };
    await axios.post('http://localhost:3001/addContract', contractItem, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setPo("");
    setOrderNum("");
    setTechnician("");
    setTerm(1);
    setStartDate("");
    await fetchContracts();
  };

  const calculateEndDate = (startDate: string, term: number) => {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + term);
    return `${start.getMonth() + 1}/${start.getDate()}/${start.getFullYear()}`;
  };

  const calculateReminderDate = (startDate: string, term: number, daysBefore: number) => {
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + term);
    endDate.setDate(endDate.getDate() - daysBefore);
    return `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;
  };

  const handleInputChange = (index: number, field: keyof Contract, value: string | number) => {
    const updatedContracts = [...contracts];
    (updatedContracts[index][field] as string | number) = value;
    if (field === 'startDate' || field === 'term') {
      updatedContracts[index].endDate = calculateEndDate(updatedContracts[index].startDate, updatedContracts[index].term);
      updatedContracts[index].reminder30Day = calculateReminderDate(updatedContracts[index].startDate, updatedContracts[index].term, 30);
      updatedContracts[index].reminder10Day = calculateReminderDate(updatedContracts[index].startDate, updatedContracts[index].term, 10);
    }
    setContracts(updatedContracts);
    setHasChanges(true);
    setChangedRows(prev => new Set(prev).add(index));
  };

  const handleDeactivatedChange = async (index: number, value: boolean) => {
    const updatedContracts = [...contracts];
    updatedContracts[index].deactivated = value;
    setContracts(updatedContracts);
    setHasChanges(true);
    setChangedRows(prev => new Set(prev).add(index));
  };

  const handleSaveChanges = async () => {
    const updatedContracts = Array.from(changedRows).map(index => contracts[index]);
    await axios.post('http://localhost:3001/updateContract', { contracts: updatedContracts }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setHasChanges(false);
    setChangedRows(new Set());
    toast.success("Saved!");
    fetchContracts();
  };

  if (backToEquipment) {
    return (
        <EquipmentForm userId={userId} customer={customer} location={location} />
    );
  }

  return (
    <div className="space-y-4">
      <ToastContainer />
      <div className="flex justify-header mb-4 space-x-8 text-center">
        <div className="mx-4 flex-grow">
          <h1 className="text-2xl font-bold text-black">Customer: {customer.name}</h1>
          <p className="text-lg text-black">{customer.address}, {customer.city}, {customer.state}, {customer.zip}</p>
          <p className="text-lg text-black">Contact: {customer.contact}</p>
          <p className="text-lg text-black">Contact Email: {customer.contactEmail}</p>
          <p className="text-lg text-black">Contact Phone: {customer.contactPhone}</p>
        </div>
        <div className="mx-4 flex-grow">
          <h2 className="text-2xl font-bold text-black">Location: {location.locationName}</h2>
          <p className="text-lg text-black">{location.locationAddress}, {location.locationCity}, {location.locationState}, {location.locationZip}</p>
          <p className="text-lg text-black">Contact: {location.locationContact}</p>
          <p className="text-lg text-black">Contact Email: {location.locationContactEmail}</p>
          <p className="text-lg text-black">Contact Phone: {location.locationContactPhone}</p>
        </div>
        <div className="mx-4 flex-grow">
          <h2 className="text-2xl font-bold text-black">Equipment: {equipment.make} {equipment.model}</h2>
          <p className="text-lg text-black">Serial: {equipment.serial}</p>
          <p className="text-lg text-black">Configuration: {equipment.configuration}</p>
          <p className="text-lg text-black">Purchase Date: {equipment.purchaseDate}</p>
          <p className="text-lg text-black">EOL Date: {equipment.eolDate}</p>
        </div>
      </div>
      <h2 className="text-xl font-bold text-black text-center">Contracts</h2>
      <table className="w-full text-black mb-4">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-center">PO #</th>
            <th className="border px-4 py-2 text-center">Order #</th>
            <th className="border px-4 py-2 text-center">Technician</th>
            <th className="border px-4 py-2 text-center">Term (yr)</th>
            <th className="border px-4 py-2 text-center">Start Date</th>
            <th className="border px-4 py-2 text-center">30 Day Reminder</th>
            <th className="border px-4 py-2 text-center">10 Day Reminder</th>
            <th className="border px-4 py-2 text-center">End Date</th>
            <th className="border px-4 py-2 text-center">Deactivated</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length === 0 ? (
            <tr>
              <td colSpan={9} className="border px-4 py-2 text-center">No contracts</td>
            </tr>
          ) : (
            contracts.map((item, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.po}
                    onChange={(e) => handleInputChange(index, 'po', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.orderNum}
                    onChange={(e) => handleInputChange(index, 'orderNum', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.technician}
                    onChange={(e) => handleInputChange(index, 'technician', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="number"
                    value={item.term}
                    onChange={(e) => handleInputChange(index, 'term', Number(e.target.value))}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="date"
                    value={item.startDate}
                    onChange={(e) => handleInputChange(index, 'startDate', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.endDate}
                    disabled
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.reminder30Day}
                    disabled
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.reminder10Day}
                    disabled
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
          className={`h-20 w-64 rounded-lg bg-red-600 font-semibold hover:bg-red-700 mt-4 ${hasChanges ? 'flash' : ''}`}
          disabled={!hasChanges}
        >
          Save
        </button>
      </div>
      <form onSubmit={handleAddContract} className="grid grid-cols-1 gap-4 mt-4">
        <input name="po" placeholder="PO #" value={po} onChange={(e) => setPo(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="orderNum" placeholder="Order #" value={orderNum} onChange={(e) => setOrderNum(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="technician" placeholder="Technician" value={technician} onChange={(e) => setTechnician(e.target.value)} required className="p-2 border rounded w-full" />
        <div>
          <label className="block text-sm text-black font-medium">Term (yr)</label>
          <input name="term" placeholder="Term (yr)" value={term} onChange={(e) => setTerm(Number(e.target.value))} required className="p-2 border rounded w-full" type="number" />
        </div>
        <div>
          <label className="block text-sm text-black font-medium">Start Date</label>
          <input name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="p-2 border rounded w-full" type="date" />
        </div>
        <button type="submit" className="h-10 w-48 rounded-lg bg-red-600 font-semibold hover:bg-red-700 mt-4 mx-auto">
          Add Contract
        </button>
      </form>
      <div className="flex flex-col items-center">
        <button
          className="h-10 w-48 rounded-lg bg-red-600 font-semibold hover:bg-red-700 mt-4"
          onClick={() => setBackToEquipment(true)}
        >
          Back to Equipment
        </button>
        <button
          className="h-10 w-48 rounded-lg bg-red-600 font-semibold hover:bg-red-700 mt-4"
          onClick={() => window.location.href = "/dashboard"}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
