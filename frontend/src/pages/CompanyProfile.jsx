import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VillaList from '../components/lists/VillaList';
import ReusableTable from '../components/common/ReusableTable';
import EditAdminModal from '../components/modals/EditAdminModal';

const CompanyProfile = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherAdmins, setOtherAdmins] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [editingAdminId, setEditingAdminId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    axios.get(`/api/companies/${companyId}`)
      .then(res => {
        setCompany(res.data);
        // Fetch admins for this company
        return axios.get('/api/admin/all');
      })
      .then(adminsRes => {
        const filteredAdmins = adminsRes.data.filter(
          (a) =>
            a.companyId === companyId ||
            (a.companyId && a.companyId._id === companyId)
        );
        setOtherAdmins(filteredAdmins);
        setLoading(false);
      })
      .catch(() => {
        setCompany(null);
        setOtherAdmins([]);
        setLoading(false);
      });
  }, [companyId]);

  // Open edit modal and fill form with selected admin data
  const handleEditClick = (admin) => {
    setEditForm({
      username: admin.username || "",
      email: admin.email || "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setEditingAdminId(admin._id);
    setPasswordError("");
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isPasswordValid = (password) => {
    const lengthCheck = password.length >= 8;
    const numberCheck = /\d/.test(password);
    const symbolCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return lengthCheck && numberCheck && symbolCheck;
  };

  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Check if password is being changed
    const isChangingPassword =
      editForm.oldPassword || editForm.newPassword || editForm.confirmPassword;

    // Password validation logic
    if (isChangingPassword) {
      if (
        !editForm.oldPassword ||
        !editForm.newPassword ||
        !editForm.confirmPassword
      ) {
        setPasswordError("All password fields are required.");
        return;
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        setPasswordError("New passwords do not match.");
        return;
      }
      if (!isPasswordValid(editForm.newPassword)) {
        setPasswordError(
          "Password must be at least 8 characters, include a number and a symbol."
        );
        return;
      }
    }
    setPasswordError(""); // Clear error if all is good

    try {
      await axios.put(`/api/admin/${editingAdminId}`, editForm);
      // Update the admin in the list
      setOtherAdmins((prev) =>
        prev.map((a) =>
          a._id === editingAdminId
            ? { ...a, username: editForm.username, email: editForm.email }
            : a
        )
      );
      setShowEditModal(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update admin details.";
      setPasswordError(errorMessage);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!company) return <div>Company not found.</div>;

  // Admins table columns
  const adminColumns = [
    {
      key: 'username',
      header: 'Admin Name',
      render: (value, row) => (
        <button
          className="font-medium text-blue-600 hover:underline"
          onClick={() => navigate(`/admin-profile/${row._id}`)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          {value}
        </button>
      ),
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            onClick={() => handleEditClick(row)}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            onClick={() => alert(`Delete admin ${row.username}`)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mx-auto bg-white shadow rounded p-6">
        <h1 className="text-3xl font-bold mb-4">{company.companyName}</h1>
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

      {/* Admins Table */}
      {otherAdmins.length > 0 && (
        <div className="bg-white shadow rounded p-6 mb-8 mt-6">
          <h3 className="text-xl font-semibold mb-2">
            Admins in Your Company
          </h3>
          <ReusableTable
            columns={adminColumns}
            data={otherAdmins}
            pagination={true}
            pageSize={5}
            emptyMessage="No other admins found."
          />
        </div>
      )}

      {/* Edit Admin Modal */}
      <EditAdminModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
        editForm={editForm}
        handleEditChange={handleEditChange}
        handleEditSubmit={handleEditSubmit}
        passwordError={passwordError}
        
      />

      <div>
        {/* Display the villa list for this company */}
        <VillaList companyId={companyId} />
      </div>
    </div>
  );
};

export default CompanyProfile;
