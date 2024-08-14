"use client";
import { useState, useEffect } from "react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
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
  equipmentIdcontractId: string;
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
  const [contract, setContract] = useState<Contract | null>(null);
  const [po, setPo] = useState("");
  const [orderNum, setOrderNum] = useState("");
  const [technician, setTechnician] = useState("");
  const [term, setTerm] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reminder30Day, setReminder30Day] = useState("");
  const [reminder10Day, setReminder10Day] = useState("");
  const [showAddContractForm, setShowAddContractForm] = useState(false);
  const [backToEquipment, setBackToEquipment] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchContract();
  }, [userId, equipment]);

  const fetchContract = async () => {
    const res = await axios.post('http://localhost:3001/getContractByEquipment', {
      uniqueUserId: userId,
      equipmentId: equipment.locationIdequipmentId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.data) {
      const existingContract = res.data;
      const calculatedEndDate = calculateEndDate(existingContract.startDate, existingContract.term);
      const calculatedReminder30Day = calculateReminderDate(calculatedEndDate, 30);
      const calculatedReminder10Day = calculateReminderDate(calculatedEndDate, 10);

      setContract(existingContract);
      setPo(existingContract.po);
      setOrderNum(existingContract.orderNum);
      setTechnician(existingContract.technician);
      setTerm(existingContract.term);
      setStartDate(existingContract.startDate);
      setEndDate(calculatedEndDate);
      setReminder30Day(calculatedReminder30Day);
      setReminder10Day(calculatedReminder10Day);
    }
  };

  const calculateEndDate = (startDate: string, term: number) => {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + term);
    return start.toISOString().split('T')[0];
  };

  const calculateReminderDate = (endDate: string, daysBefore: number) => {
    let date = new Date(endDate);
    let daysCount = 0;
    while (daysCount < daysBefore) {
      date.setDate(date.getDate() - 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) {  // Skip weekends
        daysCount++;
      }
    }
    return date.toISOString().split('T')[0];
  };

  const handleInputChange = (field: keyof Contract, value: string | number) => {
    if (contract) {
      let updatedContract = { ...contract, [field]: value };

      if (field === 'startDate' || field === 'term') {
        const updatedEndDate = calculateEndDate(
          field === 'startDate' ? value as string : startDate,
          field === 'term' ? value as number : term
        );

        const updatedReminder30Day = calculateReminderDate(updatedEndDate, 30);
        const updatedReminder10Day = calculateReminderDate(updatedEndDate, 10);

        updatedContract = {
          ...updatedContract,
        };

        // Update state with calculated values
        setEndDate(updatedEndDate);
        setReminder30Day(updatedReminder30Day);
        setReminder10Day(updatedReminder10Day);
      }

      setContract(updatedContract);
      setHasChanges(true);
    }
  };

  const handleSaveChanges = async () => {
    if (contract) {
      await axios.post('http://localhost:3001/updateContract', { contracts: [contract] }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success("Contract saved!");
      setHasChanges(false);
    }
  };

  const handleAddContract = async (e: any) => {
    e.preventDefault();

    const contractItem = {
      uniqueUserId: userId,
      equipmentId: equipment.locationIdequipmentId,
      po,
      orderNum,
      technician,
      term,
      startDate,
      equipmentIdcontractId: `${equipment.locationIdequipmentId}|${po}|${orderNum}|${technician}|${term}|${startDate}`
    };

    // Delete existing contract if any
    await axios.post('http://localhost:3001/deleteContractByEquipment', {
      uniqueUserId: userId,
      equipmentId: equipment.locationIdequipmentId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add the new contract
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
    await fetchContract();
    setShowAddContractForm(false);
  };

  const toggleAddContractForm = () => {
    // Clear the state to remove any previous values when showing the form
    setPo("");
    setOrderNum("");
    setTechnician("");
    setTerm(1);
    setStartDate("");
    setShowAddContractForm(prev => !prev);
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
      <h2 className="text-xl font-bold text-black text-center">Contract</h2>
      <table className="w-full text-black mb-4">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-center" style={{ width: "15%" }}>PO #</th>
            <th className="border px-4 py-2 text-center" style={{ width: "15%" }}>Order #</th>
            <th className="border px-4 py-2 text-center" style={{ width: "25%" }}>Technician/Provider</th>
            <th className="border px-4 py-2 text-center" style={{ width: "5%" }}>Term (yr)</th>
            <th className="border px-4 py-2 text-center">Start Date</th>
            <th className="border px-4 py-2 text-center">30 Day Reminder</th>
            <th className="border px-4 py-2 text-center">10 Day Reminder</th>
            <th className="border px-4 py-2 text-center">End Date</th>
          </tr>
        </thead>
        <tbody>
          {contract ? (
            <tr>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={contract.po}
                  onChange={(e) => handleInputChange('po', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={contract.orderNum}
                  onChange={(e) => handleInputChange('orderNum', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={contract.technician}
                  onChange={(e) => handleInputChange('technician', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={contract.term}
                  onChange={(e) => handleInputChange('term', parseInt(e.target.value))}
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="date"
                  value={contract.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="date"
                  value={reminder30Day}
                  disabled
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="date"
                  value={reminder10Day}
                  disabled
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="date"
                  value={endDate}
                  disabled
                  className="p-2 border rounded w-full"
                />
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={8} className="border px-4 py-2 text-center">No contract</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleSaveChanges}
          className={`button ${hasChanges ? 'flash' : ''}`}
          disabled={!hasChanges}
        >
          Save
        </button>
      </div>
      <div className="text-center mt-4">
        <button onClick={toggleAddContractForm} className="button">
          {showAddContractForm ? "Hide Add Contract" : "Add Contract"}
        </button>
      </div>
      {showAddContractForm && (
        <form onSubmit={handleAddContract} className="grid grid-cols-1 gap-4 mt-4">
          <input name="po" placeholder="PO #" value={po} onChange={(e) => setPo(e.target.value)} required className="p-2 border rounded w-full" />
          <input name="orderNum" placeholder="Order #" value={orderNum} onChange={(e) => setOrderNum(e.target.value)} required className="p-2 border rounded w-full" />
          <input name="technician" placeholder="Technician/Provider" value={technician} onChange={(e) => setTechnician(e.target.value)} required className="p-2 border rounded w-full" />
          <div>
            <label className="block text-sm text-black font-medium">Term (yr)</label>
            <input name="term" placeholder="Term (yr)" value={term} onChange={(e) => setTerm(Number(e.target.value))} required className="p-2 border rounded w-full" type="number" />
          </div>
          <div>
            <label className="block text-sm text-black font-medium">Start Date</label>
            <input name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="p-2 border rounded w-full" type="date" />
          </div>
          <button type="submit" className="button">
            Submit Contract
          </button>
        </form>
      )}

      <div className="flex flex-col items-center">
        <button
          className="button"
          onClick={() => setBackToEquipment(true)}
        >
          Back to Equipment
        </button>
        <button
          className="button"
          onClick={() => window.location.href = "/dashboard"}
        >
          Back to Dashboard
        </button>
        <LogoutLink postLogoutRedirectURL="/" className="button mt-4">
          Log out
        </LogoutLink>
      </div>
    </div>
  );
}
