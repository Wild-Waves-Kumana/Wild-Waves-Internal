import React, { useState, useEffect } from 'react';
import { bookingStorage } from '../../../utils/bookingStorage';

const formatLKR = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US');
};

const PaymentSection4 = ({ onBack }) => {
  const [savedBookingId, setSavedBookingId] = useState(null);
  const [prices, setPrices] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    // Get data before clearing
    const bookingId = bookingStorage.getSavedBookingId();
    const pricesData = bookingStorage.getPrices();
    const customerData = bookingStorage.getCustomer();
    
    setSavedBookingId(bookingId);
    setPrices(pricesData);
    setCustomer(customerData);

    // Clear booking data from localStorage (keep saved booking ID)
    bookingStorage.clearBookingData();
    
    console.log('Payment section loaded - booking data cleared from localStorage');
    console.log('Saved Booking ID:', bookingId);
  }, []);

  const handlePayNow = async () => {
    setLoading(true);
    // simulate payment delay
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    const ref = `PAY${Date.now().toString().slice(-8)}`;
    setConfirmation(ref);
    setPaid(true);
    
    // After successful payment, you could clear the saved booking ID too
    // bookingStorage.clearAll();
  };

  // Calculate per night total
  const perNightTotal = (prices?.villaPrice || 0) + 
    (prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0) || 0);

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold">Payment</h3>
            {savedBookingId && (
              <p className="text-sm text-gray-600 mt-1">
                Booking ID: <span className="font-mono font-medium text-blue-600">{savedBookingId}</span>
              </p>
            )}
          </div>
          <button onClick={onBack} className="text-blue-600 underline text-sm">← Back</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Payable Amount</h4>
            <div className="bg-gray-50 p-4 rounded border">
              <div className="flex justify-between">
                <span>Villa price / night</span>
                <span className="font-medium">LKR {formatLKR(prices?.villaPrice)}</span>
              </div>
              
              <div className="flex justify-between mt-2">
                <span>Rooms price / night</span>
                <span className="font-medium">
                  LKR {formatLKR(prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0))}
                </span>
              </div>

              {prices?.roomPrices && prices.roomPrices.length > 0 && (
                <div className="text-xs text-gray-600 mt-2 ml-4">
                  {prices.roomPrices.map((rp, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {rp.roomName}</span>
                      <span>LKR {formatLKR(rp.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-2 mt-2 flex justify-between">
                <span>Per night total</span>
                <span className="font-medium">LKR {formatLKR(perNightTotal)}</span>
              </div>

              <div className="flex justify-between mt-2">
                <span>Nights</span>
                <span className="font-medium">{prices?.nights || 0}</span>
              </div>

              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-green-600">
                  LKR {formatLKR(prices?.totalPrice)}
                </span>
              </div>
            </div>

            <h4 className="font-semibold">Customer</h4>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <p className="font-medium">{customer?.name || '—'}</p>
              <p className="text-xs text-gray-600">{customer?.email || '—'}</p>
              <p className="text-xs text-gray-600">{customer?.contactNumber || '—'}</p>
              {customer?.identification?.nic && (
                <p className="text-xs text-gray-600">NIC: {customer.identification.nic}</p>
              )}
              {customer?.identification?.passport && (
                <p className="text-xs text-gray-600">Passport: {customer.identification.passport}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Payment Method</h4>
            <div className="bg-gray-50 p-4 rounded border space-y-3">
              <label className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="method" 
                  value="card" 
                  checked={method === 'card'} 
                  onChange={() => setMethod('card')} 
                />
                <span>Card (dummy)</span>
              </label>

              <label className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="method" 
                  value="bank" 
                  checked={method === 'bank'} 
                  onChange={() => setMethod('bank')} 
                />
                <span>Bank Transfer (dummy)</span>
              </label>

              <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                ℹ️ This is a dummy payment section. No real payment is processed.
              </div>

              <div>
                <button
                  onClick={handlePayNow}
                  disabled={loading || paid}
                  className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                    paid ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Processing...' : paid ? '✓ Paid' : `Pay LKR ${formatLKR(prices?.totalPrice)}`}
                </button>
              </div>

              {paid && confirmation && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <div className="font-medium text-green-800">✓ Payment Successful</div>
                  <div className="text-xs text-gray-700 mt-1">
                    Payment Reference: <span className="font-mono font-medium">{confirmation}</span>
                  </div>
                  <div className="text-xs text-gray-700">
                    Booking ID: <span className="font-mono font-medium">{savedBookingId}</span>
                  </div>
                  <div className="mt-2 text-xs text-green-700">
                    Your booking has been confirmed. You will receive a confirmation email shortly.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button 
            onClick={onBack} 
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 mr-3"
            disabled={paid}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection4;