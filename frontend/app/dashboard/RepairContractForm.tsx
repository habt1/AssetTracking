import React, { useState, ChangeEvent, useEffect } from 'react';

interface RepairContractFormProps {
  type: 'repair' | 'contract';
}

const RepairContractForm: React.FC<RepairContractFormProps> = ({ type }) => {
  const [formType, setFormType] = useState(type);
  const [customDuration, setCustomDuration] = useState(0);
  const [form, setForm] = useState({
    make: '',
    model: '',
    configNumber: '',
    serialNumber: '',
    equipmentLocation: '',
    contractTerm: '1 year',
    technicianProvider: '',
    poNumber: '',
    ticketOrderNumber: '',
    contractStartDate: '',
    contractEndDate: '',
    renewalReminder30Days: '',
    renewalReminder10Days: '',
    serviceContract: false,
    warrantyService: false,
    billable: false,
    rmaNumber: '',
    maintenanceIssue: '',
    serviceDate: '',
    serviceDateReceived: '',
    shipReturnDate: '',
    shipMethod: '',
    shipTrackingNumber: '',
    technicianProviderPO: ''
  });

  useEffect(() => {
    if (form.contractStartDate && (form.contractTerm || customDuration > 0)) {
      const startDate = new Date(form.contractStartDate);
      let endDate;

      if (form.contractTerm === 'other' && customDuration > 0) {
        endDate = new Date(startDate.setFullYear(startDate.getFullYear() + customDuration));
      } else {
        switch (form.contractTerm) {
          case '1 year':
            endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
            break;
          case '3 years':
            endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 3));
            break;
          case '5 years':
            endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 5));
            break;
          default:
            endDate = new Date(startDate);
        }
      }

      const reminder30Days = new Date(endDate);
      reminder30Days.setDate(reminder30Days.getDate() - 30);
      const reminder10Days = new Date(endDate);
      reminder10Days.setDate(reminder10Days.getDate() - 10);
      setForm((prevForm) => ({
        ...prevForm,
        contractEndDate: endDate.toISOString().split('T')[0],
        renewalReminder30Days: reminder30Days.toISOString().split('T')[0],
        renewalReminder10Days: reminder10Days.toISOString().split('T')[0]
      }));
    }
  }, [form.contractStartDate, form.contractTerm, customDuration]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const isCheckbox = (event.target as HTMLInputElement).type === 'checkbox';
    const checked = (event.target as HTMLInputElement).checked;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: isCheckbox ? checked : value
    }));
  };

  const handleCustomDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomDuration(Number(event.target.value));
  };

  const handleSubmit = () => {
    console.log(form);
    // Add code to save data
  };

  return (
    <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg w-full">
      <h1 className="mb-6 text-2xl font-bold text-red-600">
        {formType === 'repair' ? (form.billable ? 'Service - Repair (Billable)' : 'Service - Repair (Not Billable)') : 'Maintenance - Service Contract'}
      </h1>
      <div className="grid grid-cols-2 gap-4 w-full mb-4">
        <select name="make" value={form.make} onChange={handleInputChange} className="p-2 border rounded text-black bg-white">
          <option value="">Select Make</option>
          <option value="Make1">Make1</option>
          <option value="Make2">Make2</option>
        </select>
        <select name="model" value={form.model} onChange={handleInputChange} className="p-2 border rounded text-black bg-white">
          <option value="">Select Model</option>
          <option value="Model1">Model1</option>
          <option value="Model2">Model2</option>
        </select>
        <select name="configNumber" value={form.configNumber} onChange={handleInputChange} className="p-2 border rounded text-black bg-white">
          <option value="">Select Config #</option>
          <option value="Config1">Config1</option>
          <option value="Config2">Config2</option>
        </select>
        <select name="serialNumber" value={form.serialNumber} onChange={handleInputChange} className="p-2 border rounded text-black bg-white">
          <option value="">Select Serial #</option>
          <option value="Serial1">Serial1</option>
          <option value="Serial2">Serial2</option>
        </select>
        <select name="equipmentLocation" value={form.equipmentLocation} onChange={handleInputChange} className="p-2 border rounded text-black bg-white">
          <option value="">Select Equipment Location</option>
          <option value="Location1">Location1</option>
          <option value="Location2">Location2</option>
        </select>
      </div>
      {formType === 'contract' ? (
        <>
          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            <select name="contractTerm" value={form.contractTerm} onChange={handleInputChange} className="p-2 border rounded text-black bg-white">
              <option value="1 year">1 Year</option>
              <option value="3 years">3 Years</option>
              <option value="5 years">5 Years</option>
              <option value="other">Other</option>
            </select>
            {form.contractTerm === 'other' && (
              <input
                type="number"
                name="customDuration"
                value={customDuration}
                onChange={handleCustomDurationChange}
                placeholder="Custom Duration (Years)"
                className="p-2 border rounded text-black bg-white"
              />
            )}
            <input
              type="text"
              name="technicianProvider"
              value={form.technicianProvider}
              onChange={handleInputChange}
              placeholder="Technician/Provider"
              className="p-2 border rounded text-black bg-white"
            />
            <input
              type="text"
              name="poNumber"
              value={form.poNumber}
              onChange={handleInputChange}
              placeholder="PO#"
              className="p-2 border rounded text-black bg-white"
            />
            <input
              type="text"
              name="ticketOrderNumber"
              value={form.ticketOrderNumber}
              onChange={handleInputChange}
              placeholder="Ticket/Order #"
              className="p-2 border rounded text-black bg-white"
            />
            <div className="flex flex-col">
              <label className="text-black mb-1">Contract Start Date</label>
              <input
                type="date"
                name="contractStartDate"
                value={form.contractStartDate}
                onChange={handleInputChange}
                className="p-2 border rounded text-black bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-black mb-1">Contract End Date</label>
              <input
                type="date"
                name="contractEndDate"
                value={form.contractEndDate}
                onChange={handleInputChange}
                readOnly
                className="p-2 border rounded text-black bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-black mb-1">Renewal Reminder (30 days prior)</label>
              <input
                type="date"
                name="renewalReminder30Days"
                value={form.renewalReminder30Days}
                onChange={handleInputChange}
                readOnly
                className="p-2 border rounded text-black bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-black mb-1">Renewal Reminder (10 days prior)</label>
              <input
                type="date"
                name="renewalReminder10Days"
                value={form.renewalReminder10Days}
                onChange={handleInputChange}
                readOnly
                className="p-2 border rounded text-black bg-white"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-black">Service Contract</label>
            <input type="checkbox" name="serviceContract" checked={form.serviceContract} onChange={handleInputChange} className="mr-2" />
            <label className="block mb-2 font-semibold text-black">Warranty Service</label>
            <input type="checkbox" name="warrantyService" checked={form.warrantyService} onChange={handleInputChange} className="mr-2" />
            <label className="block mb-2 font-semibold text-black">Billable</label>
            <input type="checkbox" name="billable" checked={form.billable} onChange={handleInputChange} className="mr-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            <input
              type="text"
              name="technicianProvider"
              value={form.technicianProvider}
              onChange={handleInputChange}
              placeholder="Technician/Provider"
              className="p-2 border rounded text-black bg-white"
            />
            <input
              type="text"
              name="rmaNumber"
              value={form.rmaNumber}
              onChange={handleInputChange}
              placeholder="RMA #"
              className="p-2 border rounded text-black bg-white"
            />
            <input
              type="text"
              name="maintenanceIssue"
              value={form.maintenanceIssue}
              onChange={handleInputChange}
              placeholder="Maintenance/Service Issue"
              className="p-2 border rounded col-span-2 text-black bg-white"
            />
            <div className="flex flex-col">
              <label className="text-black mb-1">Service Date</label>
              <input
                type="date"
                name="serviceDate"
                value={form.serviceDate}
                onChange={handleInputChange}
                className="p-2 border rounded text-black bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-black mb-1">Service Date Received</label>
              <input
                type="date"
                name="serviceDateReceived"
                value={form.serviceDateReceived}
                onChange={handleInputChange}
                className="p-2 border rounded text-black bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-black mb-1">Ship/Return Date</label>
              <input
                type="date"
                name="shipReturnDate"
                value={form.shipReturnDate}
                onChange={handleInputChange}
                className="p-2 border rounded text-black bg-white"
              />
            </div>
            <select name="shipMethod" value={form.shipMethod} onChange={handleInputChange} className="p-2 border rounded text-black bg-white">
              <option value="">Select Shipment Method</option>
              <option value="UPS">UPS</option>
              <option value="Fed_ex">Fed_ex</option>
              <option value="DHL">DHL</option>
              <option value="USPS">USPS</option>
              <option value="WILL_CALL">WILL CALL</option>
            </select>
            <input
              type="text"
              name="shipTrackingNumber"
              value={form.shipTrackingNumber}
              onChange={handleInputChange}
              placeholder="Ship Tracking Number"
              className="p-2 border rounded col-span-2 text-black bg-white"
            />
            {form.billable && (
              <>
                <input
                  type="text"
                  name="ticketOrderNumber"
                  value={form.ticketOrderNumber}
                  onChange={handleInputChange}
                  placeholder="Ticket/Order #"
                  className="p-2 border rounded col-span-2 text-black bg-white"
                />
                <input
                  type="text"
                  name="technicianProviderPO"
                  value={form.technicianProviderPO}
                  onChange={handleInputChange}
                  placeholder="Technician/Provider PO #"
                  className="p-2 border rounded col-span-2 text-black bg-white"
                />
              </>
            )}
          </div>
        </>
      )}
      <button
        className="h-10 w-32 rounded-lg bg-red-600 text-black font-semibold hover:bg-red-700"
        onClick={handleSubmit}
      >
        Save
      </button>
    </div>
  );
};

export default RepairContractForm;
