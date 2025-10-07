import React from "react";

const EmagencyContacts = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-blue-700">Emergency Contacts</h2>
    <p className="text-gray-700 mb-4">
      In case of emergency, please contact one of the following:
    </p>
    <ul className="mb-4 space-y-2">
      <li>
        <span className="font-semibold text-blue-600">Support Hotline:</span> <span className="text-gray-800">+94 77 123 4567</span>
      </li>
      <li>
        <span className="font-semibold text-blue-600">Email:</span> <span className="text-gray-800">emergency@wildwaves.com</span>
      </li>
      <li>
        <span className="font-semibold text-blue-600">Admin Contact:</span> <span className="text-gray-800">+94 71 987 6543</span>
      </li>
    </ul>
    <p className="text-gray-600">
      For urgent technical issues, please use the hotline or email above. We are here to help 24/7.
    </p>
  </div>
);

export default EmagencyContacts;