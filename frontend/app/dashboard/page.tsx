"use client";
import { useState, useEffect } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import dynamic from 'next/dynamic';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUserInfo } from "./serverActions";

const LocationForm = dynamic(() => import('./LocationForm'), { ssr: false });
const ServiceForm = dynamic(() => import('./ServiceForm'), { ssr: false });

export default function Dashboard() {
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allSerials, setAllSerials] = useState<string[]>([]);
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [serialSuggestions, setSerialSuggestions] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedSerial, setSelectedSerial] = useState<any | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [changedRows, setChangedRows] = useState<Set<number>>(new Set());
  const [showCustomerTable, setShowCustomerTable] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      const info = await getUserInfo();
      setUserId(info.id);
      await axios.post('${process.env.API_URL}/addUser', info, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setLoading(false);
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCustomersAndSerials();
    }
  }, [userId]);

  const fetchCustomersAndSerials = async () => {
    const customerRes = await axios.post('${process.env.API_URL}/getAllCustomers', {
      uniqueUserId: userId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setAllCustomers(customerRes.data);

    const serialRes = await axios.post('${process.env.API_URL}/getAllSerials', {
      uniqueUserId: userId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setAllSerials(serialRes.data);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedCustomers = [...allCustomers];
    updatedCustomers[index][field] = value;
    setAllCustomers(updatedCustomers);
    setChangedRows(prev => new Set(prev).add(index));
  };

  const handleSaveCustomer = async (index: number) => {
    const customer = allCustomers[index];
    try {
      await axios.post('${process.env.API_URL}/updateCustomer', {
        uniqueUserId: userId,
        customerId: customer.customerId,
        updates: customer
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setChangedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      toast.success("Saved!");  // Show the "Saved" toast notification
      await fetchCustomersAndSerials();
    } catch (error) {
      toast.error("Failed to save customer.");
    }
  };

  const filterCustomerSuggestions = (query: string) => {
    setCustomerName(query);
    if (query === "") {
      setCustomerSuggestions([]);
    } else if (allCustomers && allCustomers.length > 0) {
      const filtered = allCustomers.filter((customer) =>
        customer.name.toLowerCase().includes(query.toLowerCase())
      );
      setCustomerSuggestions(filtered);
    } else {
      setCustomerSuggestions([]);
    }
  };

  const filterSerialSuggestions = (query: string) => {
    setSerialNumber(query);
    if (query === "") {
      setSerialSuggestions([]);
    } else if (allSerials && allSerials.length > 0) {
      const filtered = allSerials.filter((serial) =>
        serial.toLowerCase().includes(query.toLowerCase())
      );
      setSerialSuggestions(filtered);
    } else {
      setSerialSuggestions([]);
    }
  };

  const handleAddCustomer = async (e: any) => {
    e.preventDefault();
    const customer = {
      uniqueUserId: userId,
      name: e.target.name.value,
      address: e.target.address.value || '',
      city: e.target.city.value || '',
      state: e.target.state.value || '',
      zip: e.target.zip.value || '',
      contact: e.target.contact.value || '',
      contactEmail: e.target.contactEmail.value || '',
      contactPhone: e.target.contactPhone.value || '',
    };
    try {
      await axios.post('${process.env.API_URL}/addCustomer', customer, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success("Customer added successfully!");
      await fetchCustomersAndSerials();
      setSelectedCustomer(customer);
      setShowAddCustomerForm(false); // Hide the form after submission
    } catch (error) {
      toast.error("Failed to add customer.");
    }
  };

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleSelectSerial = async (serial: string) => {
    const res = await axios.post('${process.env.API_URL}/getEquipmentBySerial', {
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

  const toggleCustomerTable = () => {
    setShowCustomerTable(prev => !prev);
  };

  const toggleAddCustomerForm = () => {
    setShowAddCustomerForm(prev => !prev);
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
      <div className="w-full bg-white rounded-lg shadow-lg">
        <ToastContainer />

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
                {customerSuggestions.map((customer, index) => (
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
                {serialSuggestions.map((serial, index) => (
                  <li key={index} onClick={() => handleSelectSerial(serial)} className="dropdown-item">
                    {serial}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="text-center">
          <button onClick={toggleCustomerTable} className="button mb-4">
            {showCustomerTable ? "Hide All Customers" : "Display All Customers"}
          </button>
          {showCustomerTable && (
            <div>
              <h2 className="text-xl font-bold text-black text-center my-6">Customer List</h2>
              <table className="w-full text-black mb-4">
                <thead>
                  <tr>
                    <th className="border px-2 py-2" style={{ width: "15%" }}>Name</th>
                    <th className="border px-2 py-2" style={{ width: "20%" }}>Address</th>
                    <th className="border px-2 py-2" style={{ width: "15%" }}>City</th>
                    <th className="border px-2 py-2" style={{ width: "5%" }}>State</th>
                    <th className="border px-2 py-2" style={{ width: "10%" }}>Zip</th>
                    <th className="border px-2 py-2" style={{ width: "10%" }}>Contact</th>
                    <th className="border px-2 py-2" style={{ width: "10%" }}>Contact Email</th>
                    <th className="border px-2 py-2" style={{ width: "10%" }}>Contact Phone</th>
                    <th className="border px-2 py-2" style={{ width: "5%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {allCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="border px-4 py-2 text-center">No customers</td>
                    </tr>
                  ) : (
                    allCustomers.map((customer, index) => (
                      <tr key={index}>
                        <td className="border px-2 py-2">
                          <input
                            type="text"
                            value={customer.name}
                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                        <td className="border px-2 py-2">
                          <input
                            type="text"
                            value={customer.address}
                            onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                        <td className="border px-2 py-2">
                          <input
                            type="text"
                            value={customer.city}
                            onChange={(e) => handleInputChange(index, 'city', e.target.value)}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                        <td className="border px-2 py-2">
                          <input
                            type="text"
                            value={customer.state}
                            onChange={(e) => handleInputChange(index, 'state', e.target.value)}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                        <td className="border px-2 py-2">
                          <input
                            type="text"
                            value={customer.zip}
                            onChange={(e) => handleInputChange(index, 'zip', e.target.value)}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                        <td className="border px-2 py-2">
                          <input
                            type="text"
                            value={customer.contact}
                            onChange={(e) => handleInputChange(index, 'contact', e.target.value)}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                        <td className="border px-2 py-2">
                          <input
                            type="text"
                            value={customer.contactEmail}
                            onChange={(e) => handleInputChange(index, 'contactEmail', e.target.value)}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                        <td className="border px-2 py-2">
                          <input
                            type="text"
                            value={customer.contactPhone}
                            onChange={(e) => handleInputChange(index, 'contactPhone', e.target.value)}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                        <td className="border px-2 py-2 text-center">
                          <button
                            onClick={() => handleSaveCustomer(index)}
                            className={`button ${changedRows.has(index) ? 'flash' : ''}`}
                            disabled={!changedRows.has(index)}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center">
          <button onClick={toggleAddCustomerForm} className="button mb-4">
            {showAddCustomerForm ? "Hide Add New Customer" : "Add New Customer"}
          </button>
          {showAddCustomerForm && (
            <form onSubmit={handleAddCustomer} className="grid grid-cols-1 gap-4">
              <input name="name" placeholder="Name" required className="p-2 border rounded w-full" />
              <input name="address" placeholder="Address" className="p-2 border rounded w-full" />
              <input name="city" placeholder="City" className="p-2 border rounded w-full" />
              <input name="state" placeholder="State" className="p-2 border rounded w-full" />
              <input name="zip" placeholder="Zip Code" className="p-2 border rounded w-full" />
              <input name="contact" placeholder="Contact" className="p-2 border rounded w-full" />
              <input name="contactEmail" placeholder="Contact Email" className="p-2 border rounded w-full" />
              <input name="contactPhone" placeholder="Contact Phone" className="p-2 border rounded w-full" />
              <button type="submit" className="button">
                Submit Customer
              </button>
            </form>
          )}
        </div>
        <LogoutLink postLogoutRedirectURL="/" className="button mt-4">
          Log out
        </LogoutLink>
      </div>
    </main>
  );
}
