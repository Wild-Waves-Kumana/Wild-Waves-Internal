import React, { useState, useEffect } from 'react';
import { bookingStorage } from '../../../utils/bookingStorage';
import BookingPreview from './BookingPreview';
import UserDetailsInput from './UserDetailsInput';

const BookingSection2 = ({ onNext, onBack }) => {
  const [bookingData, setBookingData] = useState({
    bookingDates: null,
    roomSelection: null,
    prices: null,
    customer: null
  });

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    contactNumber: '',
    identification: {
      nic: '',
      passport: ''
    }
  });

  const [errors, setErrors] = useState({});

  const loadBookingData = () => {
    try {
      const data = bookingStorage.getBookingData();
      console.log('Loaded booking data from storage:', data);
      setBookingData(data);
    } catch (e) {
      console.error('Failed to load booking data:', e);
    }
  };

  useEffect(() => {
    loadBookingData();

    // load saved customer (if any) via bookingStorage
    try {
      const saved = bookingStorage.getCustomer();
      if (saved) {
        setCustomer({
          name: saved.name || '',
          email: saved.email || '',
          contactNumber: saved.contactNumber || '',
          identification: {
            nic: saved.identification?.nic || '',
            passport: saved.identification?.passport || ''
          }
        });

        // Log passengers retrieved from localStorage
        const passengers = saved?.passengers ?? { adults: 0, children: 0 };
        console.log('Passengers from localStorage:', passengers);
      }
    } catch (e) {
      console.error('Failed to load saved customer:', e);
    }
  }, []);

  // Auto-save customer data to localStorage whenever it changes
  useEffect(() => {
    try {
      bookingStorage.saveCustomer(customer);
    } catch (e) {
      console.error('Failed to save customer data:', e);
    }
  }, [customer]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!customer.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    // Email validation
    if (!customer.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Contact number validation
    if (!customer.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[\d\s\-+()]+$/.test(customer.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    // Identification validation (at least one required)
    if (!customer.identification.nic.trim() && !customer.identification.passport.trim()) {
      newErrors.identification = 'Please provide either NIC or Passport number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Save final customer data
      bookingStorage.saveCustomer(customer);
      console.log('Customer details saved:', customer);

      if (typeof onNext === 'function') {
        onNext();
      }
    } else {
      console.log('Validation errors:', errors);
    }
  };

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Booking Preview */}
        <BookingPreview bookingData={bookingData} />

        {/* Right Column - User Details Input */}
        <UserDetailsInput 
          customer={customer}
          setCustomer={setCustomer}
          errors={errors}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            Next: Review & Confirm
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Validation Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-semibold mb-2">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {Object.values(errors).map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSection2;