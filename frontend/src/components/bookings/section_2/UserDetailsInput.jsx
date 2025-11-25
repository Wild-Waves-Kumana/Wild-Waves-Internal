import React from 'react';
import { User, Mail, Phone, CreditCard } from 'lucide-react';

const UserDetailsInput = ({ customer, setCustomer, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIdentificationChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
      ...prev,
      identification: {
        ...prev.identification,
        [name]: value
      }
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Customer Details</h3>

      {/* Name Field */}
      <div className="mb-4">
        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={customer.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500" />
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={customer.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="example@email.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Contact Number Field */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-500" />
          Contact Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="contactNumber"
          value={customer.contactNumber}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            errors.contactNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+94 XX XXX XXXX"
        />
        {errors.contactNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
        )}
      </div>

      {/* Identification Section */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-500" />
          Identification <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Please provide at least one form of identification
        </p>

        {/* NIC Field */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            NIC Number
          </label>
          <input
            type="text"
            name="nic"
            value={customer.identification.nic}
            onChange={handleIdentificationChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
              errors.identification ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="XXXXXXXXXV or XXXXXXXXXXXX"
          />
        </div>

        {/* Passport Field */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Passport Number
          </label>
          <input
            type="text"
            name="passport"
            value={customer.identification.passport}
            onChange={handleIdentificationChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
              errors.identification ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="XXXXXXXXX"
          />
        </div>

        {errors.identification && (
          <p className="text-red-500 text-xs mt-2">{errors.identification}</p>
        )}
      </div>

      {/* Info Message */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> All fields marked with{' '}
          <span className="text-red-500">*</span> are required. Please ensure your
          contact information is accurate for booking confirmation.
        </p>
      </div>
    </div>
  );
};

export default UserDetailsInput;