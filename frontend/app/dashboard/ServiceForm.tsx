"use client";
import { useState, useEffect } from "react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EquipmentForm from "./EquipmentForm";

interface Service {
  uniqueUserId: string;
  equipmentId: string;
  serviceDateIn: string;
  rma: string;
  orderNum: string;
  po: string;
  technician: string;
  issue: string;
  serviceDateReceived: string;
  returnDate: string;
  shipMethod: string;
  tracking: string;
  equipmentIdserviceId: string;
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

export default function ServiceForm({ userId, equipment, location, customer }: { userId: string, equipment: Equipment, location: Location, customer: Customer }) {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceDateIn, setServiceDateIn] = useState("");
  const [rma, setRma] = useState("");
  const [orderNum, setOrderNum] = useState("");
  const [po, setPo] = useState("");
  const [technician, setTechnician] = useState("");
  const [issue, setIssue] = useState("");
  const [serviceDateReceived, setServiceDateReceived] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [shipMethod, setShipMethod] = useState("");
  const [tracking, setTracking] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [changedRows, setChangedRows] = useState<Set<number>>(new Set());
  const [backToEquipment, setBackToEquipment] = useState(false);

  const fetchServices = async () => {
    const res = await axios.post('http://localhost:3001/getServicesByEquipment', {
      uniqueUserId: userId,
      equipmentId: equipment.locationIdequipmentId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setServices(res.data);
  };

  useEffect(() => {
    fetchServices();
  }, [userId, equipment]);

  const handleAddService = async (e: any) => {
    e.preventDefault();
    const serviceItem = {
      uniqueUserId: userId,
      equipmentId: equipment.locationIdequipmentId,
      serviceDateIn,
      rma,
      orderNum,
      po,
      technician,
      issue,
      serviceDateReceived,
      returnDate,
      shipMethod,
      tracking,
      deactivated: false,
      equipmentIdserviceId: `${equipment.locationIdequipmentId}|${serviceDateIn}|${rma}|${orderNum}|${po}|${technician}|${issue}|${serviceDateReceived}|${returnDate}|${shipMethod}|${tracking}`
    };
    await axios.post('http://localhost:3001/addService', serviceItem, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setServiceDateIn("");
    setRma("");
    setOrderNum("");
    setPo("");
    setTechnician("");
    setIssue("");
    setServiceDateReceived("");
    setReturnDate("");
    setShipMethod("");
    setTracking("");
    await fetchServices();
  };

  const handleInputChange = (index: number, field: keyof Service, value: string) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
    setHasChanges(true);
    setChangedRows(prev => new Set(prev).add(index));
  };

  const handleDeactivatedChange = async (index: number, value: boolean) => {
    const updatedServices = [...services];
    updatedServices[index].deactivated = value;
    setServices(updatedServices);
    setHasChanges(true);
    setChangedRows(prev => new Set(prev).add(index));
  };

  const handleSaveChanges = async () => {
    const updatedServices = Array.from(changedRows).map(index => services[index]);
    await axios.post('http://localhost:3001/updateService', { service: updatedServices }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setHasChanges(false);
    setChangedRows(new Set());
    toast.success("Saved!");
    fetchServices();
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
      <h2 className="text-xl font-bold text-black text-center">Services</h2>
      <table className="w-full text-black mb-4">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-center">Service Date In</th>
            <th className="border px-4 py-2 text-center">RMA #</th>
            <th className="border px-4 py-2 text-center">Order #</th>
            <th className="border px-4 py-2 text-center">PO #</th>
            <th className="border px-4 py-2 text-center">Technician</th>
            <th className="border px-4 py-2 text-center">Issue</th>
            <th className="border px-4 py-2 text-center">Service Date Received</th>
            <th className="border px-4 py-2 text-center">Return Date</th>
            <th className="border px-4 py-2 text-center">Ship Method</th>
            <th className="border px-4 py-2 text-center">Tracking #</th>
            <th className="border px-4 py-2 text-center">Deactivated</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan={11} className="border px-4 py-2 text-center">No services</td>
            </tr>
          ) : (
            services.map((item, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  <input
                    type="date"
                    value={item.serviceDateIn}
                    onChange={(e) => handleInputChange(index, 'serviceDateIn', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.rma}
                    onChange={(e) => handleInputChange(index, 'rma', e.target.value)}
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
                    value={item.po}
                    onChange={(e) => handleInputChange(index, 'po', e.target.value)}
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
                    type="text"
                    value={item.issue}
                    onChange={(e) => handleInputChange(index, 'issue', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="date"
                    value={item.serviceDateReceived}
                    onChange={(e) => handleInputChange(index, 'serviceDateReceived', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="date"
                    value={item.returnDate}
                    onChange={(e) => handleInputChange(index, 'returnDate', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.shipMethod}
                    onChange={(e) => handleInputChange(index, 'shipMethod', e.target.value)}
                    disabled={item.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={item.tracking}
                    onChange={(e) => handleInputChange(index, 'tracking', e.target.value)}
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
          className={`h-20 w-64 rounded-lg bg-red-600 font-semibold hover:bg-red-700 mt-4 ${hasChanges ? 'flash' : ''}`}
          disabled={!hasChanges}
        >
          Save
        </button>
      </div>
      <form onSubmit={handleAddService} className="grid grid-cols-1 gap-4 mt-4">
        <div>
          <label className="block text-sm text-black font-medium">Service Date In</label>
          <input name="serviceDateIn" value={serviceDateIn} onChange={(e) => setServiceDateIn(e.target.value)} required className="p-2 border rounded w-full" type="date" />
        </div>
        <input name="rma" placeholder="RMA #" value={rma} onChange={(e) => setRma(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="order" placeholder="Order #" value={orderNum} onChange={(e) => setOrderNum(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="po" placeholder="PO #" value={po} onChange={(e) => setPo(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="technician" placeholder="Technician" value={technician} onChange={(e) => setTechnician(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="issue" placeholder="Issue" value={issue} onChange={(e) => setIssue(e.target.value)} required className="p-2 border rounded w-full" />
        <div>
          <label className="block text-sm text-black font-medium">Service Date Received</label>
          <input name="serviceDateReceived" value={serviceDateReceived} onChange={(e) => setServiceDateReceived(e.target.value)} required className="p-2 border rounded w-full" type="date" />
        </div>
        <div>
          <label className="block text-sm text-black font-medium">Return Date</label>
          <input name="returnDate" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required className="p-2 border rounded w-full" type="date" />
        </div>
        <input name="shipMethod" placeholder="Ship Method" value={shipMethod} onChange={(e) => setShipMethod(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="tracking" placeholder="Tracking #" value={tracking} onChange={(e) => setTracking(e.target.value)} required className="p-2 border rounded w-full" />
        <button type="submit" className="h-10 w-48 rounded-lg bg-red-600 font-semibold hover:bg-red-700 mt-4 mx-auto">
          Add Service
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
