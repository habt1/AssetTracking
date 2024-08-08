"use client";
import { useState, useEffect } from "react";
import axios from 'axios';
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
  deactivated: boolean;
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

  const fetchLocations = async () => {
    const res = await axios.post('http://localhost:3001/getLocationsByCustomer', {
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
      deactivated: false,
      customerIdlocationId: `${customer.customerId}|${locationName}|${locationAddress}|${locationCity}|${locationState}|${locationZip}|${locationContact}|${locationContactEmail}|${locationContactPhone}`
    };
    await axios.post('http://localhost:3001/addLocation', location, {
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
  };

  const handleSaveChanges = async () => {
    const updatedLocations = Array.from(changedRows).map(index => locations[index]);
    await axios.post('http://localhost:3001/updateLocations', { locations: updatedLocations }, {
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

  const handleDeactivatedChange = (index: number, value: boolean) => {
    const updatedLocations = [...locations];
    updatedLocations[index].deactivated = value;
    setLocations(updatedLocations);
    setHasChanges(true);
    setChangedRows(prev => new Set(prev).add(index));
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
            <th className="border px-4 py-2"></th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Address</th>
            <th className="border px-4 py-2">City</th>
            <th className="border px-4 py-2">State</th>
            <th className="border px-4 py-2">Zip</th>
            <th className="border px-4 py-2">Contact</th>
            <th className="border px-4 py-2">Contact Email</th>
            <th className="border px-4 py-2">Contact Phone</th>
            <th className="border px-4 py-2">Deactivated</th>
          </tr>
        </thead>
        <tbody>
          {locations.length === 0 ? (
            <tr>
              <td colSpan={10} className="border px-4 py-2 text-center">No locations</td>
            </tr>
          ) : (
            locations.map((location, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  {!location.deactivated && (
                    <button
                      onClick={() => setSelectedLocation(location)}
                      className="h-8 w-24 rounded-lg table-button bg-blue-600 font-semibold hover:bg-blue-700"
                    >
                      Select
                    </button>
                  )}
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={location.locationName}
                    onChange={(e) => handleInputChange(index, 'locationName', e.target.value)}
                    disabled={location.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={location.locationAddress}
                    onChange={(e) => handleInputChange(index, 'locationAddress', e.target.value)}
                    disabled={location.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={location.locationCity}
                    onChange={(e) => handleInputChange(index, 'locationCity', e.target.value)}
                    disabled={location.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={location.locationState}
                    onChange={(e) => handleInputChange(index, 'locationState', e.target.value)}
                    disabled={location.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={location.locationZip}
                    onChange={(e) => handleInputChange(index, 'locationZip', e.target.value)}
                    disabled={location.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={location.locationContact}
                    onChange={(e) => handleInputChange(index, 'locationContact', e.target.value)}
                    disabled={location.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={location.locationContactEmail}
                    onChange={(e) => handleInputChange(index, 'locationContactEmail', e.target.value)}
                    disabled={location.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={location.locationContactPhone}
                    onChange={(e) => handleInputChange(index, 'locationContactPhone', e.target.value)}
                    disabled={location.deactivated}
                    className="p-2 border rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={location.deactivated}
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
      <form onSubmit={handleAddLocation} className="grid grid-cols-1 gap-4 mt-4">
        <input name="locationName" placeholder="Location Name" value={locationName} onChange={(e) => setLocationName(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="locationAddress" placeholder="Location Address" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="locationCity" placeholder="Location City" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="locationState" placeholder="Location State" value={locationState} onChange={(e) => setLocationState(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="locationZip" placeholder="Location Zip Code" value={locationZip} onChange={(e) => setLocationZip(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="locationContact" placeholder="Location Contact" value={locationContact} onChange={(e) => setLocationContact(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="locationEmail" placeholder="Location Email" value={locationContactEmail} onChange={(e) => setLocationContactEmail(e.target.value)} required className="p-2 border rounded w-full" />
        <input name="locationPhone" placeholder="Location Phone" value={locationContactPhone} onChange={(e) => setLocationContactPhone(e.target.value)} required className="p-2 border rounded w-full" />
        <button type="submit" className="h-10 w-48 rounded-lg bg-red-600 font-semibold hover:bg-red-700 mt-4 mx-auto">
          Add Location
        </button>
      </form>
      <button
        className="h-10 w-48 rounded-lg bg-red-600 font-semibold hover:bg-red-700 mt-4 mx-auto"
        onClick={() => window.location.href = "/dashboard"}
      >
        Back
      </button>
    </div>
  );
}
