"use client";
import { useState, useEffect } from "react";
import axios from 'axios';
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EquipmentForm from "./EquipmentForm";

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
  customerIdlocationId: string;
}

export default function LocationForm({ userId, customer }: { userId: string, customer: any }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationZip, setLocationZip] = useState("");
  const [locationContact, setLocationContact] = useState("");
  const [locationContactEmail, setLocationContactEmail] = useState("");
  const [locationContactPhone, setLocationContactPhone] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [changedRows, setChangedRows] = useState<Set<number>>(new Set());
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);

  const usStatesAndCanadianProvinces = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK", "NT", "NU", "YT"
  ];

  const fetchLocations = async () => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/getLocationsByCustomer`, {
      uniqueUserId: userId,
      customerId: customer.customerId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setLocations(res.data);
  };

  useEffect(() => {
    fetchLocations();
  }, [userId, customer]);

  const handleAddLocation = async (e: any) => {
    e.preventDefault();
    const location = {
      uniqueUserId: userId,
      customerId: customer.customerId,
      locationName,
      locationAddress,
      locationCity,
      locationState,
      locationZip,
      locationContact,
      locationContactEmail,
      locationContactPhone,
      customerIdlocationId: `${customer.customerId}|${locationName}|${locationAddress}|${locationCity}|${locationState}|${locationZip}|${locationContact}|${locationContactEmail}|${locationContactPhone}`
    };
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/addLocation`, location, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setLocationName("");
    setLocationAddress("");
    setLocationCity("");
    setLocationState("");
    setLocationZip("");
    setLocationContact("");
    setLocationContactEmail("");
    setLocationContactPhone("");
    
    // Refresh the locations list
    fetchLocations();
    setShowAddLocationForm(false);
  };

  const handleSaveChanges = async () => {
    const updatedLocations = Array.from(changedRows).map(index => locations[index]);
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/updateLocations`, { locations: updatedLocations }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setHasChanges(false);
    setChangedRows(new Set());
    toast.success("Saved!");
    fetchLocations(); // Refresh the locations list
  };

  const handleInputChange = (index: number, field: keyof Location, value: string) => {
    const updatedLocations = [...locations];
    (updatedLocations[index][field] as string | number) = value;
    setLocations(updatedLocations);
    setHasChanges(true);
    setChangedRows(prev => new Set(prev).add(index));
  };

  const toggleAddLocationForm = () => {
    setShowAddLocationForm(prev => !prev);
  };

  if (selectedLocation) {
    return (
        <EquipmentForm userId={userId} customer={customer} location={selectedLocation} />
    );
  }

  return (
    <div className="space-y-4">
      <ToastContainer />
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-black">Customer: {customer.name}</h1>
        <p className="text-lg text-black">{customer.address}, {customer.city}, {customer.state}, {customer.zip}</p>
        <p className="text-lg text-black">Contact: {customer.contact}</p>
        <p className="text-lg text-black">Contact Email: {customer.contactEmail}</p>
        <p className="text-lg text-black">Contact Phone: {customer.contactPhone}</p>
      </div>
      <h2 className="text-xl font-bold text-black">Locations</h2>
      <table className="w-full text-black mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-2" style={{ width: "5%" }}></th>
            <th className="border px-2 py-2" style={{ width: "20%" }}>Name</th>
            <th className="border px-2 py-2" style={{ width: "20%" }}>Address</th>
            <th className="border px-2 py-2" style={{ width: "15%" }}>City</th>
            <th className="border px-2 py-2" style={{ width: "5%" }}>State</th>
            <th className="border px-2 py-2" style={{ width: "10%" }}>Zip</th>
            <th className="border px-2 py-2" style={{ width: "10%" }}>Contact</th>
            <th className="border px-2 py-2" style={{ width: "10%" }}>Contact Email</th>
            <th className="border px-2 py-2" style={{ width: "10%" }}>Contact Phone</th>
          </tr>
        </thead>
        <tbody>
          {locations.length === 0 ? (
            <tr>
              <td colSpan={9} className="border px-4 py-2 text-center">No locations</td>
            </tr>
          ) : (
            locations.map((location, index) => (
              <tr key={index}>
                <td className="border px-2 py-2">
                    <button
                      onClick={() => setSelectedLocation(location)}
                      className="h-8 w-24 rounded-lg table-button bg-blue-600 font-semibold hover:bg-blue-700"
                    >
                      Select
                    </button>
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    value={location.locationName}
                    onChange={(e) => handleInputChange(index, 'locationName', e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    value={location.locationAddress}
                    onChange={(e) => handleInputChange(index, 'locationAddress', e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    value={location.locationCity}
                    onChange={(e) => handleInputChange(index, 'locationCity', e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-2 py-2">
                  <select
                    value={location.locationState}
                    onChange={(e) => handleInputChange(index, 'locationState', e.target.value)}
                    className="p-2 border rounded w-full"
                  >
                    {usStatesAndCanadianProvinces.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    value={location.locationZip}
                    onChange={(e) => handleInputChange(index, 'locationZip', e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    value={location.locationContact}
                    onChange={(e) => handleInputChange(index, 'locationContact', e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    value={location.locationContactEmail}
                    onChange={(e) => handleInputChange(index, 'locationContactEmail', e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    value={location.locationContactPhone}
                    onChange={(e) => handleInputChange(index, 'locationContactPhone', e.target.value)}
                    className="p-2 border rounded w-full"
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
          className={`button ${hasChanges ? 'flash' : ''}`}
          disabled={!hasChanges}
        >
          Save
        </button>
      </div>

      <div>
        <button onClick={toggleAddLocationForm} className="button mb-4">
          {showAddLocationForm ? "Hide Add New Location" : "Add New Location"}
        </button>
        {showAddLocationForm && (
          <form onSubmit={handleAddLocation} className="grid grid-cols-1 gap-4">
            <input name="locationName" placeholder="Name" value={locationName} onChange={(e) => setLocationName(e.target.value)} required className="p-2 border rounded w-full" />
            <input name="locationAddress" placeholder="Address" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} className="p-2 border rounded w-full" />
            <input name="locationCity" placeholder="City" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} className="p-2 border rounded w-full" />
            <div className="flex flex-col items-start">
              <label className="block text-sm text-black font-medium">State</label>
              <select
                name="locationState"
                value={locationState}
                onChange={(e) => setLocationState(e.target.value)}
                className="p-2 border rounded w-full text-black"
              >
                <option value="" disabled>Select State</option>
                {usStatesAndCanadianProvinces.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <input name="locationZip" placeholder="Zip Code" value={locationZip} onChange={(e) => setLocationZip(e.target.value)} className="p-2 border rounded w-full" />
            <input name="locationContact" placeholder="Contact" value={locationContact} onChange={(e) => setLocationContact(e.target.value)} className="p-2 border rounded w-full" />
            <input name="locationEmail" placeholder="Contact Email" value={locationContactEmail} onChange={(e) => setLocationContactEmail(e.target.value)} className="p-2 border rounded w-full" />
            <input name="locationPhone" placeholder="Contact Phone" value={locationContactPhone} onChange={(e) => setLocationContactPhone(e.target.value)} className="p-2 border rounded w-full" />
            <button type="submit" className="button">
              Submit Location
            </button>
          </form>
        )}
      </div>
      <button
        className="button"
        onClick={() => window.location.href = "/dashboard"}
      >
        Back
      </button>
      <LogoutLink postLogoutRedirectURL="/" className="button mt-4">
          Log out
      </LogoutLink>
    </div>
  );
}
