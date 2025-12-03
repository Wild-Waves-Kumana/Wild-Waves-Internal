import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, UserPlus, Sparkles } from 'lucide-react';

const SignupOptions = () => {
  const navigate = useNavigate();

  const handleBookingSignup = () => {
    // Navigate to booking signup flow
    navigate('/booking-signup');
  };

  const handleInstantSignup = () => {
    // Navigate to instant signup
    navigate('/instant-signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Welcome Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Wild Waves</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience luxury and comfort at our premium villas. Choose your preferred signup method to get started on your journey with us.
          </p>
        </div>

        {/* Signup Options Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Signup Option */}
          <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Sign up via Booking
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Perfect for those ready to reserve their villa stay. Complete your signup while making your first booking reservation.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-start text-sm text-gray-600">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  Book your villa instantly
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  Secure your preferred dates
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  Complete profile during booking
                </li>
              </ul>

              {/* Button */}
              <button
                onClick={handleBookingSignup}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Start with Booking
                <Calendar className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Instant Signup Option */}
          <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-8 h-8 text-purple-600" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Instant Signup
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Quick and easy registration to explore our villas. Create your account first and book whenever you're ready.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-start text-sm text-gray-600">
                  <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 mr-2"></span>
                  Quick 2-minute signup
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 mr-2"></span>
                  Browse villas at your pace
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 mr-2"></span>
                  Book later when ready
                </li>
              </ul>

              {/* Button */}
              <button
                onClick={handleInstantSignup}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Quick Signup
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-semibold underline decoration-2 underline-offset-2 transition-colors"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupOptions;
