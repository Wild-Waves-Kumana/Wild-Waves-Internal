import React, { useState } from 'react';
import BookingSection1 from '../../components/bookings/section_1/BookingSection1';
import BookingSection2 from '../../components/bookings/section_2/BookingSection2';
import BookingSection3 from '../../components/bookings/BookingSection3';

const CreateBooking = () => {
  const [currentSection, setCurrentSection] = useState(1);

  const handleNext = () => {
    setCurrentSection(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentSection(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = () => {
    setCurrentSection(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFrom3 = () => {
    setCurrentSection(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmFinal = () => {
    // proceed to payment or submission
    console.log('Confirmed booking summary. Proceed to payment/submission.');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentSection >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentSection >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Select Dates & Rooms</span>
            </div>
            <div className="w-12 h-1 bg-gray-300">
              <div className={`h-full transition-all ${currentSection >= 2 ? 'bg-blue-600 w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex items-center ${currentSection >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentSection >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Review & Confirm</span>
            </div>
            <div className="w-12 h-1 bg-gray-300">
              <div className={`h-full transition-all ${currentSection >= 3 ? 'bg-blue-600 w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex items-center ${currentSection >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentSection >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Summary</span>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {currentSection === 1 ? 'Create New Booking' : currentSection === 2 ? 'Review Booking Details' : 'Booking Summary'}
        </h2>

        {/* Sections */}
        {currentSection === 1 && <BookingSection1 onNext={handleNext} />}
        {currentSection === 2 && <BookingSection2 onBack={handleBack} onNext={handleContinue} />}
        {currentSection === 3 && <BookingSection3 onBack={handleBackFrom3} onNext={handleConfirmFinal} />}
      </div>
    </div>
  );
};

export default CreateBooking;