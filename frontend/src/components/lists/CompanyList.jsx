import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../common/ReusableTable';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/companies/all')
      .then(res => {
        setCompanies(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: 'companyName',
      header: 'Company Name',
      sortable: true,
      filterable: false,
      render: (value, row) => (
        <button
          className="text-blue-600 hover:underline"
          onClick={() => navigate(`/company-profile/${row._id}`)}
        >
          {value}
        </button>
      ),
    },
    {
      key: 'companyId',
      header: 'Company ID',
      sortable: true,
      filterable: false,
    },
    {
      key: 'villas',
      header: 'Villas Count',
      sortable: false,
      filterable: false,
      render: (value, row) => (row.villas ? row.villas.length : 0),
    },
    {
      key: 'admins',
      header: 'Admins Count',
      sortable: false,
      filterable: false,
      render: (value, row) => (row.admins ? row.admins.length : 0),
    },
    {
      key: 'users',
      header: 'Users Count',
      sortable: false,
      filterable: false,
      render: (value, row) => (row.users ? row.users.length : 0),
    },
  ];

  return (
    <div className=" bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Company List</h2>
      <ReusableTable
        columns={columns}
        data={companies}
        loading={loading}
        searchable={true}
        sortable={true}
        filterable={true}
        pagination={true}
        pageSize={10}
        emptyMessage="No companies found."
      />
    </div>
  );
};

export default CompanyList;