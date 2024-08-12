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
  endDate: string;
  reminder30Day: string;
  reminder10Day: string;
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
      existingContract.endDate = formatDate(calculateEndDate(existingContract.startDate, existingContract.term));
      existingContract.reminder30Day = formatDate(calculateReminderDate(existingContract.endDate, 30));
      existingContract.reminder10Day = formatDate(calculateReminderDate(existingContract.endDate, 10));
      existingContract.startDate = formatDate(existingContract.startDate);
      setContract(existingContract);
      setPo(existingContract.po);
      setOrderNum(existingContract.orderNum);
      setTechnician(existingContract.technician);
      setTerm(existingContract.term);
      setStartDate(existingContract.startDate);
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

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleInputChange = (field: keyof Contract, value: string | number) => {
    if (contract) {
      setContract({ ...contract, [field]: value });
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
    const endDate = formatDate(calculateEndDate(startDate, term));
    const reminder30Day = formatDate(calculateReminderDate(endDate, 30));
    const reminder10Day = formatDate(calculateReminderDate(endDate, 10));

    const contractItem = {
      uniqueUserId: userId,
      equipmentId: equipment.locationIdequipmentId,
      po,
      orderNum,
      technician,
      term,
      startDate: formatDate(startDate),
      endDate,
      reminder30Day,
      reminder10Day,
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
          <p className="text-lg text-black">Purchase Date: {formatDate(equipment.purchaseDate)}</p>
          <p className="text-lg text-black">EOL Date: {formatDate(equipment.eolDate)}</p>
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
            <th className="border px-4 py-2 text-center">End Date</th>
            <th className="border px-4 py-2 text-center">30 Day Reminder</th>
            <th className="border px-4 py-2 text-center">10 Day Reminder</th>
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
                  type="text"
                  value={contract.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={contract.endDate}
                  disabled
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={contract.reminder30Day}
                  disabled
                  className="p-2 border rounded w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={contract.reminder10Day}
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
