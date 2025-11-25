import React from 'react';
import { CreditCard } from 'lucide-react';

const PaymentMethods = ({ method, setMethod, disabled }) => {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</h4>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
          <input 
            type="radio" 
            name="method" 
            value="card" 
            checked={method === 'card'} 
            onChange={() => setMethod('card')}
            disabled={disabled}
            className="w-4 h-4 text-blue-600"
          />
          <CreditCard className="w-5 h-5 text-gray-600" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Credit/Debit Card</div>
            <div className="text-xs text-gray-500">Pay securely with your card</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
          <input 
            type="radio" 
            name="method" 
            value="bank" 
            checked={method === 'bank'} 
            onChange={() => setMethod('bank')}
            disabled={disabled}
            className="w-4 h-4 text-blue-600"
          />
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Bank Transfer</div>
            <div className="text-xs text-gray-500">Direct bank transfer</div>
          </div>
        </label>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Demo Payment</p>
          <p className="text-xs">This is a dummy payment section. No real payment is processed.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;