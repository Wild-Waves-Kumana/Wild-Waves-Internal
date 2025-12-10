import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { CheckCircle, Calendar, Home, Users, Building2, Loader, AlertCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const QRResultsModal = ({ isVisible, onClose, data, onScanAgain, onContinue }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [villaDetails, setVillaDetails] = useState(null);
  const [roomsDetails, setRoomsDetails] = useState([]);

  // Validate booking eligibility
  const validateBooking = (booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(booking.bookingDates?.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);

    // Check 1: Check-in date should be today
    if (checkInDate.getTime() !== today.getTime()) {
      return {
        isValid: false,
        reason: 'Check-in Date Mismatch',
        message: `Your check-in date is ${checkInDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}. You can only create an account on your check-in date (today).`
      };
    }

    // Check 2: User signup should be false
    if (booking.userSignup === true) {
      return {
        isValid: false,
        reason: 'Account Already Created',
        message: 'A user account has already been created for this booking. Each booking can only have one account.'
      };
    }

    // Check 3: Payment status should be 'paid'
    if (booking.paymentStatus !== 'paid') {
      return {
        isValid: false,
        reason: 'Payment Not Completed',
        message: `Your payment status is "${booking.paymentStatus}". You must complete the payment before creating an account. Please contact support or complete your payment.`
      };
    }

    return { isValid: true };
  };

  // Fetch full booking details when modal opens
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!isVisible || !data?.bookingId) return;

      setLoading(true);
      setError(null);
      setValidationError(null);

      try {
        // Fetch booking by ID
        const response = await axios.get(`/api/bookings/${data.bookingId}`);
        const booking = response.data.booking;

        // Validate booking
        const validation = validateBooking(booking);
        if (!validation.isValid) {
          // keep booking details so we can show booking.bookingId (not internal _id) in the error view
          setBookingDetails(booking);
          setValidationError(validation);
          setLoading(false);
          return;
        }

        setBookingDetails(booking);

        // Fetch company details
        if (booking.roomSelection?.companyId) {
          try {
            const companyRes = await axios.get(`/api/companies/${booking.roomSelection.companyId}`);
            setCompanyDetails(companyRes.data);
          } catch (err) {
            console.error('Error fetching company:', err);
          }
        }

        // Fetch villa details
        if (booking.roomSelection?.villaId) {
          try {
            const villaId = typeof booking.roomSelection.villaId === 'object'
              ? booking.roomSelection.villaId._id
              : booking.roomSelection.villaId;
            const villaRes = await axios.get(`/api/villas/${villaId}`);
            setVillaDetails(villaRes.data);
          } catch (err) {
            console.error('Error fetching villa:', err);
          }
        }

        // Fetch room details
        if (booking.roomSelection?.rooms?.length > 0) {
          try {
            const roomIds = booking.roomSelection.rooms.map(room => {
              if (typeof room.roomId === 'object' && room.roomId !== null) {
                return room.roomId._id;
              }
              return room.roomId;
            });

            const roomPromises = roomIds.map(roomId =>
              axios.get(`/api/rooms/${roomId}`)
                .then(response => response.data)
                .catch(error => {
                  console.error(`Error fetching room ${roomId}:`, error);
                  return null;
                })
            );

            const rooms = await Promise.all(roomPromises);
            const validRooms = rooms.filter(room => room !== null);
            setRoomsDetails(validRooms);
          } catch (err) {
            console.error('Error fetching rooms:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [isVisible, data?.bookingId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isVisible) {
      setBookingDetails(null);
      setCompanyDetails(null);
      setVillaDetails(null);
      setRoomsDetails([]);
      setError(null);
      setValidationError(null);
    }
  }, [isVisible]);

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-3xl w-full">
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Validation Error Display */}
        {validationError && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Cannot Create Account
            </h3>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">{validationError.reason}</h4>
                  <p className="text-sm text-red-700">{validationError.message}</p>
                </div>
              </div>
            </div>

            {data?.bookingId && (
              <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Booking ID</div>
                <div className="font-mono font-semibold text-gray-800">
                  {bookingDetails?.bookingId || data.bookingId || bookingDetails?._id}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h5 className="text-sm font-semibold text-blue-900 mb-2">What to do next:</h5>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                {validationError.reason === 'Check-in Date Mismatch' && (
                  <>
                    <li>• Wait until your check-in date to create an account</li>
                    <li>• Keep your booking QR code safe</li>
                    <li>• Scan the QR code on your check-in date</li>
                  </>
                )}
                {validationError.reason === 'Account Already Created' && (
                  <>
                    <li>• Use your existing account credentials to log in</li>
                    <li>• Contact support if you forgot your password</li>
                    <li>• Do not create duplicate accounts</li>
                  </>
                )}
                {validationError.reason === 'Payment Not Completed' && (
                  <>
                    <li>• Complete your payment through the booking platform</li>
                    <li>• Contact support for payment assistance</li>
                    <li>• Return here after payment is confirmed</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (onScanAgain) onScanAgain();
                  if (onClose) onClose();
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Scan Another Code
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Success - Show Booking Details */}
        {!validationError && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Verified!
              </h3>
              <p className="text-gray-600">
                All requirements met. Review your booking details below to continue with signup.
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading booking details...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {!loading && bookingDetails && (
              <>
                {/* Booking ID Badge */}
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">Booking ID</div>
                  <div className="font-mono font-semibold text-blue-800 text-lg">
                    {bookingDetails.bookingId}
                  </div>
                  <div className="text-xs text-gray-600 mt-2 flex gap-3">
                    <span>
                      Status: <span className="capitalize font-medium text-gray-800">{bookingDetails.status}</span>
                    </span>
                    <span>
                      Payment: <span className="capitalize font-medium text-green-600">{bookingDetails.paymentStatus}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Dates Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Booking Dates
                    </h4>
                    <div className="space-y-2 text-sm bg-sky-50 border border-sky-200 p-4 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium text-gray-800">
                          {bookingDetails.bookingDates?.checkInDate
                            ? new Date(bookingDetails.bookingDates.checkInDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium text-gray-800">
                          {bookingDetails.bookingDates?.checkOutDate
                            ? new Date(bookingDetails.bookingDates.checkOutDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Total Nights:</span>
                        <span className="font-semibold text-blue-600">
                          {bookingDetails.bookingDates?.nights || 0} {bookingDetails.bookingDates?.nights === 1 ? 'Night' : 'Nights'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Passengers Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      Passengers
                    </h4>
                    <div className="space-y-2 text-sm bg-sky-50 border border-sky-200 p-4 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adults:</span>
                        <span className="font-medium text-gray-800">{bookingDetails.customer?.passengers?.adults || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Children:</span>
                        <span className="font-medium text-gray-800">{bookingDetails.customer?.passengers?.children || 0}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-purple-600">
                          {(bookingDetails.customer?.passengers?.adults || 0) + (bookingDetails.customer?.passengers?.children || 0)} Passengers
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Company */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      Company
                    </h4>
                    {companyDetails ? (
                      <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
                        <p className="font-semibold text-gray-900">{companyDetails.companyName}</p>
                        <p className="text-xs text-gray-500 mt-1">{companyDetails.companyId}</p>
                      </div>
                    ) : (
                      <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
                        <p className="text-sm text-gray-500 italic">Loading company...</p>
                      </div>
                    )}
                  </div>

                  {/* Villa */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Home className="w-4 h-4 text-green-500" />
                      Villa
                    </h4>
                    {villaDetails ? (
                      <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">{villaDetails.villaName}</p>
                          <p className="text-xs text-gray-600">
                            {bookingDetails.roomSelection?.acStatus === 1
                              ? "AC"
                              : bookingDetails.roomSelection?.acStatus === 0
                              ? "Non-AC"
                              : "Not specified"}
                          </p>
                        </div>
                        {villaDetails.villaLocation && (
                          <p className="text-xs text-gray-600 mt-1">{villaDetails.villaLocation}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
                        <p className="text-sm text-gray-500 italic">Loading villa...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rooms Section */}
                {roomsDetails.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Home className="w-4 h-4 text-green-500" />
                        Selected Rooms
                      </h4>
                      <span className="text-xs text-gray-600 bg-green-100 px-2 py-1 rounded-full">
                        {roomsDetails.length} {roomsDetails.length === 1 ? 'Room' : 'Rooms'}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="flex gap-3 pb-2">
                        {roomsDetails.map((room, idx) => (
                          <div
                            key={room._id || idx}
                            className="bg-green-50 border border-green-200 rounded-md p-3 text-sm min-w-[200px] flex-shrink-0"
                          >
                            <div className="font-medium text-gray-800 mb-1">{room.roomName}</div>
                            <div className="space-y-1">
                              {room.capacity > 0 && (
                                <div className="text-xs text-gray-600 flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{room.capacity} {room.capacity === 1 ? 'person' : 'persons'}</span>
                                </div>
                              )}
                              {room.type && (
                                <div className="text-xs text-gray-600 capitalize">
                                  Type: {room.type}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Details */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    Customer Details
                  </h4>
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div>
                        <span className="text-xs text-gray-600">Name:</span>
                        <p className="font-medium text-gray-900">{bookingDetails.customer?.name || '—'}</p>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-600">Email:</span>
                        <p className="font-medium text-gray-700">{bookingDetails.customer?.email || '—'}</p>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-600">Contact:</span>
                        <p className="font-medium text-gray-700">{bookingDetails.customer?.contactNumber || '—'}</p>
                      </div>
                    </div>

                    {(bookingDetails.customer?.identification?.nic || bookingDetails.customer?.identification?.passport) && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Identification:</div>
                        {bookingDetails.customer?.identification?.nic && (
                          <p className="text-xs text-gray-700">NIC: {bookingDetails.customer.identification.nic}</p>
                        )}
                        {bookingDetails.customer?.identification?.passport && (
                          <p className="text-xs text-gray-700 mt-1">Passport: {bookingDetails.customer.identification.passport}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Summary */}
                {bookingDetails.prices && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Pricing Summary</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Villa Price:</span>
                        <span className="font-medium text-gray-800">LKR {bookingDetails.prices.villaPrice?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Nights:</span>
                        <span className="font-medium text-gray-800">{bookingDetails.prices.nights || 0}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="font-semibold text-gray-900">Total Amount:</span>
                        <span className="font-bold text-blue-600 text-lg">LKR {bookingDetails.prices.totalPrice?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (onScanAgain) onScanAgain();
                  if (onClose) onClose();
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Scan Again
              </button>
              <button
                onClick={() => {
                  if (onContinue) onContinue();
                }}
                disabled={loading || error}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
              >
                Continue to Signup
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default QRResultsModal;
