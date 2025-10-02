import React from "react";



const Aboutus = () => (
  <div
    className="overflow-auto m-2 [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-gray-100
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-300"
    style={{ height: "calc(100vh - 200px)" }}
  >
    <h2 className="text-2xl font-bold text-blue-700 mb-4">About Us</h2>
    
    <p className="text-gray-700 mb-6">
      <strong>Wild Waves</strong> is a smart home control platform designed to make your living space more comfortable, secure, and energy-efficient.
      Our mission is to empower users and companies with intuitive tools for managing devices, food services, and more.
    </p>
    <h3 className="text-lg font-semibold text-gray-800 mb-3">Our Mission</h3>
    <p className="text-gray-700 mb-6">
      To revolutionize smart home management by providing hassle-free, efficient, and modern solutions that promote smooth workflows and eliminate the need for physical tools.
    </p>
    <h3 className="text-lg font-semibold text-gray-800 mb-3">Our Vision</h3>
    <p className="text-gray-700 mb-6">
      Our vision is to deliver a secure, user-friendly, and efficient smart home system that simplifies management for everyone. By integrating modern technologies, we aim to help users enhance security, streamline daily operations, and transition to a more digital lifestyle.
    </p>
    <h3 className="text-lg font-semibold text-gray-800 mb-3">Meet the Developers</h3>
    <div className="mt-8 text-gray-700">
      For more information, support, or partnership inquiries, please contact us at{" "}
      <a href="mailto:support@wildwaves.com" className="text-blue-600 underline">
        support@wildwaves.com
      </a>.
    </div>
  </div>
);

export default Aboutus;