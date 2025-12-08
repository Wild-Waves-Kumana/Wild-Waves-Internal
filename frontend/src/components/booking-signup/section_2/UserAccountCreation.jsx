import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RandomAvatar from '../../common/RandomAvatar';
import { User, Key, RefreshCw, Eye, EyeOff } from 'lucide-react';

const UserAccountCreation = ({ bookingId }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate username: user-ddmmyy-xxx
  const generateUsername = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const random = Math.floor(100 + Math.random() * 900); // 3 digits
    return `user-${dd}${mm}${yy}-${random}`;
  };

  // Generate a unique username by checking with backend
  const generateUniqueUsername = async () => {
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
        attempts++;
      }
      attempts++;
    }
    
    setUsername(newUsername);
    setLoading(false);
    return newUsername;
  };

  // Generate unique username on mount
  useEffect(() => {
    generateUniqueUsername();
  }, []);

  // Handle avatar selection from RandomAvatar
  const handleAvatarSelect = (url) => {
    setAvatarUrl(url);
  };

  // Password validation
  const isPasswordValid = (pwd) => {
    const lengthCheck = pwd.length >= 8;
    const numberCheck = /\d/.test(pwd);
    const symbolCheck = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return { lengthCheck, numberCheck, symbolCheck, isValid: lengthCheck && numberCheck && symbolCheck };
  };

  // Handle password change
  const handlePasswordChange = (e) => {
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
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
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
  };

  return (
    <div className="space-y-6">
      {/* Generated Username */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
            disabled={loading}
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
          Select Avatar
        </label>
        <RandomAvatar onSelect={handleAvatarSelect} />
        {avatarUrl && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">Selected avatar:</span>
            <img
              src={avatarUrl}
              alt="Selected Avatar"
              className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-md"
            />
          </div>
        )}
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
              required
              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
              required
              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Password Error Message */}
        {passwordError && (
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
            <span className="font-mono font-semibold text-gray-900">{bookingId || '—'}</span>
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
        </div>
      </div>
    </div>
  );
};

export default UserAccountCreation;
