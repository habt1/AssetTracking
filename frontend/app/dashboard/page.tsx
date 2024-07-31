"use client";
import { useState, useEffect } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import dynamic from 'next/dynamic';
import axios from 'axios';
import { getUserInfo } from "./serverActions";

const LocationForm = dynamic(() => import('./LocationForm'), { ssr: false });
const EquipmentForm = dynamic(() => import('./EquipmentForm'), { ssr: false });
const ServiceForm = dynamic(() => import('./ServiceForm'), { ssr: false });

export default function Dashboard() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [allSerials, setAllSerials] = useState([]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [serialSuggestions, setSerialSuggestions] = useState([]);
  const [userId, setUserId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedSerial, setSelectedSerial] = useState<any | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      const info = await getUserInfo();
      setUserId(info.id);
      await axios.post('http://localhost:3001/addUser', info, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await fetchCustomersAndSerials();
      setLoading(false);
    }
    fetchInitialData();
  }, []);

  const fetchCustomersAndSerials = async () => {
    const customerRes = await axios.post('http://localhost:3001/getAllCustomers', {
      uniqueUserId: userId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setAllCustomers(customerRes.data);


    const serialRes = await axios.post('http://localhost:3001/getAllSerials', {
      uniqueUserId: userId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setAllCustomers(customerRes.data);
    setAllSerials(serialRes.data);
  };

  const filterCustomerSuggestions = (query: string) => {
    setCustomerName(query);
    if (query === "") {
      setCustomerSuggestions([]);
    } else {
      const filtered = allCustomers.filter((customer: any) =>
        customer.name.toLowerCase().includes(query.toLowerCase())
      );
      setCustomerSuggestions(filtered);
    }
  };

  const filterSerialSuggestions = (query: string) => {
    setSerialNumber(query);
    if (query === "") {
      setSerialSuggestions([]);
    } else {
      const filtered = allSerials.filter((serial: string) =>
        serial.toLowerCase().includes(query.toLowerCase())
      );
      setSerialSuggestions(filtered);
    }
  };

  const handleAddCustomer = async (e: any) => {
    e.preventDefault();
    const customer = {
      uniqueUserId: userId,
      name: e.target.name.value,
      address: e.target.address.value,
      city: e.target.city.value,
      state: e.target.state.value,
      zip: e.target.zip.value,
      contact: e.target.contact.value,
      contactEmail: e.target.contactEmail.value,
      contactPhone: e.target.contactPhone.value,
    };
    await axios.post('http://localhost:3001/addCustomer', customer, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await fetchCustomersAndSerials();
    setSelectedCustomer(customer);
  };

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleSelectSerial = async (serial: string) => {
    const res = await axios.post('http://localhost:3001/getEquipmentBySerial', {
      uniqueUserId: userId,
      serial
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { equipment, location, customer } = res.data;
    setSelectedSerial({ equipment, location, customer });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8 relative">
        <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-lg text-center">
          <p className="text-black">Loading...</p>
        </div>
      </main>
    );
  }

  if (selectedCustomer) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8 relative">
        <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-lg">
          <LocationForm userId={userId} customer={selectedCustomer} />
        </div>
      </main>
    );
  }

  if (selectedSerial) {
    const { equipment, location, customer } = selectedSerial;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8 relative">
        <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-lg">
          <ServiceForm userId={userId} equipment={equipment} location={location} customer={customer} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8 relative">
      <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="relative mr-4">
            <input
              type="text"
              placeholder="Search Customer"
              value={customerName}
              onChange={(e) => filterCustomerSuggestions(e.target.value)}
              className="mb-4 p-2 search-border rounded w-64"
            />
            {customerSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded mt-1 z-10 text-black">
                {customerSuggestions.map((customer: any, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectCustomer(customer)}
                    className="dropdown-item"
                  >
                    {customer.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Serial Number"
              value={serialNumber}
              onChange={(e) => filterSerialSuggestions(e.target.value)}
              className="mb-4 p-2 search-border rounded w-64"
            />
            {serialSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded mt-1 z-10 text-black">
                {serialSuggestions.map((serial: string, index) => (
                  <li key={index} onClick={() => handleSelectSerial(serial)} className="dropdown-item">
                    {serial}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="text-center">
          <form onSubmit={handleAddCustomer} className="grid grid-cols-1 gap-4">
            <input name="name" placeholder="Customer Name" required className="p-2 border rounded w-full" />
            <input name="address" placeholder="Customer Address" required className="p-2 border rounded w-full" />
            <input name="city" placeholder="Customer City" required className="p-2 border rounded w-full" />
            <input name="state" placeholder="Customer State" required className="p-2 border rounded w-full" />
            <input name="zip" placeholder="Customer Zip Code" required className="p-2 border rounded w-full" />
            <input name="contact" placeholder="Customer Contact" required className="p-2 border rounded w-full" />
            <input name="contactEmail" placeholder="Contact Email" required className="p-2 border rounded w-full" />
            <input name="contactPhone" placeholder="Contact Phone" required className="p-2 border rounded w-full" />
            <button type="submit" className="h-10 w-48 rounded-lg bg-red-600 font-semibold hover:bg-red-700 mt-4 mx-auto">
              Add Customer
            </button>
          </form>
          <LogoutLink postLogoutRedirectURL="/" className="mt-4 text-red-600">
            Log out
          </LogoutLink>
        </div>
      </div>
    </main>
  );
}
