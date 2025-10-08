import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CompanyProfile = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    axios.get(`/api/company/${companyId}`)
      .then(res => {
        setCompany(res.data);
        setLoading(false);
      })
      .catch(() => {
        setCompany(null);
        setLoading(false);
      });
  }, [companyId]);

  if (loading) return <div>Loading...</div>;
  if (!company) return <div>Company not found.</div>;

  return (
    <div className=" mx-auto bg-white shadow rounded p-6 ">
      <h1 className="text-3xl font-bold mb-4">Company Profile {company.companyName}</h1>
      <div className="mb-2">
        <strong>Company Name:</strong> {company.companyName}
      </div>
      <div className="mb-2">
        <strong>Company ID:</strong> {company.companyId}
      </div>
      <div className="mb-2">
        <strong>Admins:</strong> {company.admins ? company.admins.length : 0}
      </div>
      <div className="mb-2">
        <strong>Villas:</strong> {company.villas ? company.villas.length : 0}
      </div>
      <div className="mb-2">
        <strong>Users:</strong> {company.users ? company.users.length : 0}
      </div>
    </div>
  );
};

export default CompanyProfile;
