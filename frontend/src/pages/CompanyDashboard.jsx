import React from 'react';
import CompanyList from '../components/lists/CompanyList';
import AdminList from '../components/lists/AdminList';

const CompanyDashboard = () => {
  return (
    <div >
      <CompanyList />
      <AdminList />
    </div>
  );
};

export default CompanyDashboard;