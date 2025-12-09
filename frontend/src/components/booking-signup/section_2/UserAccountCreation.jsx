import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import RandomAvatar from '../../common/RandomAvatar';
import UserSignupResultModal from './UserSignupResultModal';
import { User, Key, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react';

const UserAccountCreation = ({ bookingId, onAccountCreated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdUserData, setCreatedUserData] = useState(null);

  // Generate username: user-ddmmyy-xxx
  const generateUsername = useCallback(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const random = Math.floor(100 + Math.random() * 900);
    return `user-${dd}${mm}${yy}-${random}`;
  }, []);

  // Generate a unique username by checking with backend
  const generateUniqueUsername = useCallback(async () => {
    setLoading(true);
    let unique = false;
    let newUsername = '';
    let attempts = 0;
    const maxAttempts = 10;

    while (!unique && attempts < maxAttempts) {
      newUsername = generateUsername();
      try {
        const checkRes = await axios.get(`/api/auth/check-username/${newUsername}`);
        if (checkRes.data.available) {
          unique = true;
        }
      } catch (err) {
        console.error('Error checking username:', err);
      }
      attempts++;
    }
    
    setUsername(newUsername);
    setLoading(false);
    return newUsername;
  }, [generateUsername]);

  // Get token and decode to get adminId
  useEffect(() => {
    const fetchAdminAndCompanyData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      try {
        // Decode token to get adminId
        const decoded = jwtDecode(token);
        const decodedAdminId = decoded.id;
        setAdminId(decodedAdminId);

        // Fetch admin details to get companyId
        const adminRes = await axios.get(`/api/admin/${decodedAdminId}`);
        const fetchedCompanyId = adminRes.data.companyId?._id || adminRes.data.companyId;
        setCompanyId(fetchedCompanyId);

      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin information');
      }
    };

    fetchAdminAndCompanyData();
  }, []);

  // Fetch booking data
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) return;
      
      try {
        const response = await axios.get(`/api/bookings/${bookingId}`);
        setBookingData(response.data.booking);
      } catch (err) {
        console.error('Error fetching booking data:', err);
        setError('Failed to load booking data');
      }
    };

    fetchBookingData();
  }, [bookingId]);

  // Generate unique username on mount
  useEffect(() => {
    generateUniqueUsername();
  }, [generateUniqueUsername]);

  // Handle avatar selection from RandomAvatar
  const handleAvatarSelect = useCallback((url) => {
    setAvatarUrl(url);
  }, []);

  // Password validation
  const isPasswordValid = useCallback((pwd) => {
    const lengthCheck = pwd.length >= 8;
    const numberCheck = /\d/.test(pwd);
    const symbolCheck = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return { lengthCheck, numberCheck, symbolCheck, isValid: lengthCheck && numberCheck && symbolCheck };
  }, []);

  // Handle password change
  const handlePasswordChange = useCallback((e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    
    if (pwd) {
      const validation = isPasswordValid(pwd);
      if (!validation.isValid) {
        let errors = [];
        if (!validation.lengthCheck) errors.push('at least 8 characters');
        if (!validation.numberCheck) errors.push('at least 1 number');
        if (!validation.symbolCheck) errors.push('at least 1 special character');
        setPasswordError(`Password must contain ${errors.join(', ')}.`);
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [isPasswordValid]);

  // Handle confirm password change
  const handleConfirmPasswordChange = useCallback((e) => {
    const confirmPwd = e.target.value;
    setConfirmPassword(confirmPwd);
    
    if (confirmPwd && password && confirmPwd !== password) {
      setPasswordError('Passwords do not match');
    } else if (confirmPwd && password && confirmPwd === password) {
      const validation = isPasswordValid(password);
      if (!validation.isValid) {
        let errors = [];
        if (!validation.lengthCheck) errors.push('at least 8 characters');
        if (!validation.numberCheck) errors.push('at least 1 number');
        if (!validation.symbolCheck) errors.push('at least 1 special character');
        setPasswordError(`Password must contain ${errors.join(', ')}.`);
      } else {
        setPasswordError('');
      }
    }
  }, [password, isPasswordValid]);

  // Create user account
  const handleCreateAccount = async () => {
    // Validation
    if (!username) {
      setError('Username is required');
      return;
    }

    if (!avatarUrl) {
      setError('Please select an avatar');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Password is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const validation = isPasswordValid(password);
    if (!validation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    if (!bookingData) {
      setError('Booking data not loaded');
      return;
    }

    if (!adminId || !companyId) {
      setError('Admin information not loaded');
      return;
    }

    setCreating(true);
    setError('');

    try {
      // Extract room IDs from booking
      const roomIds = bookingData.roomSelection?.rooms?.map(room => {
        if (typeof room.roomId === 'object' && room.roomId !== null) {
          return room.roomId._id;
        }
        return room.roomId;
      }) || [];

      // Extract villa ID from booking
      const villaId = typeof bookingData.roomSelection?.villaId === 'object'
        ? bookingData.roomSelection.villaId._id
        : bookingData.roomSelection?.villaId;

      // Prepare user data
      const userData = {
        username,
        password,
        avatarUrl,
        role: 'user',
        adminId,
        checkinDate: bookingData.bookingDates?.checkInDate,
        checkoutDate: bookingData.bookingDates?.checkOutDate,
        villaId: villaId,
        rooms: roomIds,
        bookingId: bookingData._id,
      };

      console.log('Creating user with data:', userData);

      // Create user via API
      const response = await axios.post('/api/auth/register', userData);

      // Mark success
      setSuccess(true);
      setCreatedUserData(response.data.user);

      // Try to update booking
      try {
        await axios.patch(`/api/bookings/${bookingData._id}`, {
          userSignup: true
        });
      } catch (patchErr) {
        console.error('Booking update failed (non-fatal):', patchErr);
      }

      // Show success modal
      setShowSuccessModal(true);

      // Call callback if provided
      if (onAccountCreated) {
        onAccountCreated(response.data.user);
      }

    } catch (err) {
      console.error('Error creating account:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
      generateUniqueUsername();
    } finally {
      setCreating(false);
    }
  };

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return (
      username &&
      avatarUrl &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      isPasswordValid(password).isValid &&
      !passwordError &&
      adminId &&
      companyId &&
      bookingData
    );
  }, [username, avatarUrl, password, confirmPassword, passwordError, adminId, companyId, bookingData, isPasswordValid]);

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h6 className="font-semibold text-red-800 mb-1">Error</h6>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Generated Username */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          Generated Username
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={username}
            readOnly
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 font-mono text-gray-800 font-semibold cursor-not-allowed focus:outline-none"
          />
          <button
            type="button"
            onClick={generateUniqueUsername}
            disabled={loading || success}
            className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Regenerate Username"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This username will be used to log in to your account
        </p>
      </div>

      {/* Avatar Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Avatar <span className="text-red-500">*</span>
        </label>
        <RandomAvatar onSelect={handleAvatarSelect} disabled={success} />
      </div>

      {/* Password Section */}
      <div className="pt-4 border-t border-gray-200">
        <h5 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-500" />
          Set Your Password
        </h5>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              disabled={success}
              required
              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={success}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={success}
              required
              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={success}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Password Error Message */}
        {passwordError && !success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{passwordError}</p>
          </div>
        )}

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h6 className="text-xs font-semibold text-blue-900 mb-2">Password Requirements:</h6>
          <ul className="text-xs text-blue-800 space-y-1">
            <li className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              At least 8 characters long
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              Contains at least 1 number
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              Contains at least 1 special character (!@#$%^&*...)
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${password && confirmPassword && password === confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              Passwords match
            </li>
          </ul>
        </div>
      </div>

      {/* Account Summary */}
      <div className="pt-4 border-t border-gray-200">
        <h5 className="text-sm font-bold text-gray-800 mb-3">Account Summary</h5>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700 font-medium">Username:</span>
            <span className="font-mono font-semibold text-gray-900">{username || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 font-medium">Booking ID:</span>
            <span className="font-mono font-semibold text-gray-900">{bookingData?.bookingId || '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Avatar:</span>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-purple-400" />
            ) : (
              <span className="text-gray-500 text-xs italic">Not selected</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Password:</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              password && confirmPassword && password === confirmPassword && isPasswordValid(password).isValid
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {password && confirmPassword && password === confirmPassword && isPasswordValid(password).isValid
                ? '✓ Valid'
                : 'Not set'}
            </span>
          </div>
          {bookingData && (
            <>
              <div className="flex justify-between text-xs pt-2 border-t border-purple-200">
                <span className="text-gray-600">Check-in:</span>
                <span className="text-gray-800">
                  {new Date(bookingData.bookingDates?.checkInDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Check-out:</span>
                <span className="text-gray-800">
                  {new Date(bookingData.bookingDates?.checkOutDate).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Account Button */}
      {!success && (
        <div className="pt-4">
          <button
            onClick={handleCreateAccount}
            disabled={!isFormValid() || creating}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && bookingData && (
        <UserSignupResultModal
          isVisible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          bookingData={bookingData}
          userData={createdUserData}
        />
      )}
    </div>
  );
};

export default UserAccountCreation;
