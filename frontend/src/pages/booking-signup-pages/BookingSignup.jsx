import React, { useState, useEffect, useCallback  } from 'react';
import { Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import BookingSignupSec1 from '../../components/booking-signup/section_1/BookingSignupSec1';
import BookingSignupSec2 from '../../components/booking-signup/section_2/BookingSignupSec2';
import BookingSignupSec3 from '../../components/booking-signup/section_3/BookingSignupSec3';

const SECTIONS = {
  SCAN: 1,
  DETAILS: 2,
  VERIFY: 3
};

const SECTION_TITLES = {
  [SECTIONS.DETAILS]: 'Complete Your Details',
  [SECTIONS.VERIFY]: 'Verify & Create Account'
};

const PROGRESS_STEPS = [
  { id: SECTIONS.SCAN, label: 'Scan QR Code' },
  { id: SECTIONS.DETAILS, label: 'Your Details' },
  { id: SECTIONS.VERIFY, label: 'Verify & Complete' }
];

const BookingSignup = () => {
  const [currentSection, setCurrentSection] = useState(SECTIONS.SCAN);
  const [scannedData, setScannedData] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  
  const location = useLocation();

  // Load scanned data from navigation state
  useEffect(() => {
    const bookingData = location.state?.bookingData;
    if (bookingData) {
      setScannedData(bookingData);
      setCurrentSection(SECTIONS.DETAILS);
    }
  }, [location.state]);

  // Smooth scroll to top helper
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle QR scan completion
  const handleScanComplete = useCallback((data) => {
    setScannedData(data);
    setCurrentSection(SECTIONS.DETAILS);
    scrollToTop();
  }, [scrollToTop]);

  // Navigation handlers
  const handleBackToScan = useCallback(() => {
    setCurrentSection(SECTIONS.SCAN);
    setScannedData(null);
    scrollToTop();
  }, [scrollToTop]);

  const handleContinueToVerify = useCallback(() => {
    setCurrentSection(SECTIONS.VERIFY);
    scrollToTop();
  }, [scrollToTop]);

  const handleBackToDetails = useCallback(() => {
    setCurrentSection(SECTIONS.DETAILS);
    scrollToTop();
  }, [scrollToTop]);

  // Clear all data and reset
  const handleClearData = useCallback(() => {
    setScannedData(null);
    setCurrentSection(SECTIONS.SCAN);
    setShowClearModal(false);
    scrollToTop();
  }, [scrollToTop]);

  // Toggle clear modal
  const toggleClearModal = useCallback(() => {
    setShowClearModal(prev => !prev);
  }, []);


  // Show clear button when not on first section
  const showClearButton = currentSection > SECTIONS.SCAN;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentSection={currentSection} steps={PROGRESS_STEPS} />

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">

          {showClearButton && (
            <button
              onClick={toggleClearModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              title="Clear all signup data"
            >
              <Trash2 className="w-4 h-4" />
              Start Over
            </button>
          )}
        </div>

        {/* Section Content */}
        <div className="transition-opacity duration-300">
          {currentSection === SECTIONS.SCAN && (
            <BookingSignupSec1 onScanComplete={handleScanComplete} />
          )}
          {currentSection === SECTIONS.DETAILS && (
            <BookingSignupSec2 
              bookingData={scannedData} 
              onBack={handleBackToScan} 
              onNext={handleContinueToVerify} 
            />
          )}
          {currentSection === SECTIONS.VERIFY && (
            <BookingSignupSec3 
              bookingData={scannedData} 
              onBack={handleBackToDetails} 
            />
          )}
        </div>

        {/* Clear Confirmation Modal */}
        {showClearModal && (
          <ClearModal 
            onConfirm={handleClearData} 
            onCancel={toggleClearModal} 
          />
        )}
      </div>
    </div>
  );
};

// Progress Indicator Component
const ProgressIndicator = ({ currentSection, steps }) => (
  <div className="mb-6">
    <div className="flex items-center justify-center space-x-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <ProgressStep 
            stepNumber={step.id}
            label={step.label}
            isActive={currentSection >= step.id}
          />
          {index < steps.length - 1 && (
            <ProgressConnector isActive={currentSection > step.id} />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// Progress Step Component
const ProgressStep = ({ stepNumber, label, isActive }) => (
  <div className={`flex items-center ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
      isActive 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
        : 'bg-gray-300 text-gray-600'
    }`}>
      {stepNumber}
    </div>
    <span className="ml-2 font-medium hidden sm:inline transition-colors duration-300">
      {label}
    </span>
  </div>
);

// Progress Connector Component
const ProgressConnector = ({ isActive }) => (
  <div className="w-12 h-1 bg-gray-300 rounded-full overflow-hidden">
    <div className={`h-full transition-all duration-500 ${
      isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600 w-full' : 'w-0'
    }`}></div>
  </div>
);

// Clear Confirmation Modal Component
const ClearModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Start Over?
        </h3>
        <p className="text-gray-600 mb-6">
          This will clear all your signup progress including scanned booking data and entered details. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default BookingSignup;