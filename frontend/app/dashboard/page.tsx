"use client";
import { useState, useEffect } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import dynamic from 'next/dynamic';
import { getUserInfo } from './serverActions';
import axios from 'axios';

const EquipmentForm = dynamic(() => import('./EquipmentForm'), { ssr: false });

export default function Dashboard() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [allSerials, setAllSerials] = useState([]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [serialSuggestions, setSerialSuggestions] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  useEffect(() => {
    async function fetchInitialData() {
      const info = await getUserInfo();
      setUserId(info.id);
      await axios.post('http://localhost:3001/addUser', info, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      fetchCustomersAndSerials();
    }
    fetchInitialData();
  }, []);

  const fetchCustomersAndSerials = async () => {
    const customerRes = await axios.get('http://localhost:3001/getAllCustomers');
    setAllCustomers(customerRes.data);

    const serialRes = await axios.get('http://localhost:3001/getAllSerials');
    setAllSerials(serialRes.data);
  };


  const filterCustomerSuggestions = (query: string) => { // Add type annotation to query parameter
    setCustomerName(query);
    if (query === "") {
      setCustomerSuggestions([]);
    } else {
      const filtered = allCustomers.filter((customer: string) => // Add type annotation to customer parameter
        customer.toLowerCase().startsWith(query.toLowerCase())
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
        serial.toLowerCase().startsWith(query.toLowerCase())
      );
      setSerialSuggestions(filtered);
    }
  };

  const handleAddCustomer = async (e) => {
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
    await fetchCustomersAndSerials(); // Re-fetch customers to include the new one
    setSelectedCustomer(customer.name); // Set the selected customer after adding
  };

  const handleSelectCustomer = (customer: string) => {
    setSelectedCustomer(customer);
  };

  if (selectedCustomer) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8 relative">
        <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-lg">
          <EquipmentForm />
          <div className="mt-4 flex justify-between">
            <button
              className="h-10 w-32 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              onClick={() => setSelectedCustomer(null)} // Go back to the initial screen
            >
              Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8 relative">
      <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-lg">
        <div className="mb-6 text-center">
          <input
            type="text"
            placeholder="Search Customer"
            value={customerName}
            onChange={(e) => filterCustomerSuggestions(e.target.value)}
            className="mb-4 p-2 border rounded w-1/2"
          />
          <ul className="mb-4">
            {customerSuggestions.map((customer, index) => (
              <li key={index} onClick={() => handleSelectCustomer(customer)} className="cursor-pointer text-black">
                {customer}
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Search Serial Number"
            value={serialNumber}
            onChange={(e) => filterSerialSuggestions(e.target.value)}
            className="mb-4 p-2 border rounded w-1/2"
          />
          <ul className="mb-4">
            {serialSuggestions.map((serial, index) => (
              <li key={index} className="text-black">{serial}</li>
            ))}
          </ul>
        </div>
        <div className="text-center">
          <h2 className="text-black">Add Customer</h2>
          <form onSubmit={handleAddCustomer} className="grid grid-cols-1 gap-4">
            <input name="name" placeholder="Name" required className="p-2 border rounded w-full"/>
            <input name="address" placeholder="Address" required className="p-2 border rounded w-full"/>
            <input name="city" placeholder="City" required className="p-2 border rounded w-full"/>
            <input name="state" placeholder="State" required className="p-2 border rounded w-full"/>
            <input name="zip" placeholder="Zip Code" required className="p-2 border rounded w-full"/>
            <input name="contact" placeholder="Contact" required className="p-2 border rounded w-full"/>
            <input name="contactEmail" placeholder="Contact Email" required className="p-2 border rounded w-full"/>
            <input name="contactPhone" placeholder="Contact Phone" required className="p-2 border rounded w-full"/>
            <button type="submit" className="h-10 w-48 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 mt-4 mx-auto">
              Submit
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
