import React from "react";

const AppInformation = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-blue-700">App Information</h2>
    <ul className="mb-4 space-y-2">
      <li>
        <span className="font-semibold text-blue-600">App Name:</span> <span className="text-gray-800">Wild Waves</span>
      </li>
      <li>
        <span className="font-semibold text-blue-600">Version:</span> <span className="text-gray-800">v1.0.0</span>
      </li>
      <li>
        <span className="font-semibold text-blue-600">Release Date:</span> <span className="text-gray-800">October 2025</span>
      </li>
      <li>
        <span className="font-semibold text-blue-600">Developed By:</span> <span className="text-gray-800">Wild Waves Team</span>
      </li>
    </ul>
    <p className="text-gray-600">
      Wild Waves is a smart home control platform for modern living. For updates and support, visit our website or contact us at <a href="mailto:support@wildwaves.com" className="text-blue-600 underline">support@wildwaves.com</a>.
    </p>
  </div>
);

export default AppInformation;