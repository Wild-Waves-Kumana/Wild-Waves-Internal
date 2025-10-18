import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AdminList from "../components/lists/AdminList";
import EditAdminModal from "../components/modals/EditAdminModal";
import Toaster from "../components/common/Toaster";

const SuperAdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allAdmins, setAllAdmins] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [superAdminsCount, setSuperAdminsCount] = useState(0);
  const [companyAdminsCount, setCompanyAdminsCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    const fetchSuperAdminProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const adminId = decoded.adminId || decoded._id || decoded.id;

        // Fetch the super admin's profile
        const res = await axios.get(`/api/admin/${adminId}`);
        setAdmin(res.data);

        // Fetch all admins for super admin (include current so we can count roles accurately)
        const adminsRes = await axios.get("/api/admin/all");
        const admins = adminsRes.data || [];
        setAllAdmins(admins);

        // Count superadmins based on admins collection (case-insensitive, trim spaces)
        const saCount = admins.filter((a) => {
          const role = (a.role || "").toString().toLowerCase().replace(/\s+/g, "");
          return role === "superadmin";
        }).length;
        setSuperAdminsCount(saCount);

        // Count company admins based on admins collection (case-insensitive, trim spaces)
        const caCount = admins.filter((a) => {
          const role = (a.role || "").toString().toLowerCase().replace(/\s+/g, "");
          return role === "admin";
        }).length;
        setCompanyAdminsCount(caCount);

        // Fetch all companies
        const companiesRes = await axios.get("/api/company/all");
        setAllCompanies(companiesRes.data || []);

        // Fetch all users
        const usersRes = await axios.get("/api/users/");
        setAllUsers(usersRes.data || []);
      } catch {
        setAdmin(null);
        setAllAdmins([]);
        setAllCompanies([]);
        setAllUsers([]);
        setSuperAdminsCount(0);
        setCompanyAdminsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSuperAdminProfile();
  }, []);

  // Open edit modal and fill form with current admin data
  const handleEditClick = () => {
    setEditForm({
      username: admin.username || "",
      email: admin.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
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
      editForm.newPassword || editForm.confirmPassword;

    // Password validation logic
    if (isChangingPassword) {
      if (!editForm.newPassword || !editForm.confirmPassword) {
        setPasswordError("New password and confirmation are required.");
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
      await axios.put(`/api/admin/${admin._id}`, editForm);
      setAdmin((prev) => ({
        ...prev,
        username: editForm.username,
        email: editForm.email,
      }));
      setShowEditModal(false);

      // Show success toast
      if (isChangingPassword) {
        showToast("Password updated successfully!", "success");
      } else {
        showToast("Profile updated successfully!", "success");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update admin details.";
      setPasswordError(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  // derive number shown in "All Admins Management" (exclude current admin)
  const nonCurrentAdmins = allAdmins.filter((a) => a._id !== admin?._id).length;

  if (loading) return <div>Loading...</div>;
  if (!admin) return <div>Super Admin profile not found.</div>;

  return (
    <div className="mx-auto">
      <div className="bg-white shadow rounded p-6 mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-4">Super Admin Profile</h2>
          <div className="mb-2">
            <strong>Username:</strong> {admin.username}
          </div>
          <div className="mb-2">
            <strong>Email:</strong> {admin.email}
          </div>
          <div className="mb-2">
            <strong>Role:</strong> {admin.role || "Super Admin"}
          </div>
          <div className="mb-2">
            <strong>Company:</strong> {admin.companyId ? "N/A (Super Admin)" : "All Companies"}
          </div>
        </div>
        <div className="flex flex-col gap-2 ml-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleEditClick}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Admin Modal */}
      <EditAdminModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
        editForm={editForm}
        handleEditChange={handleEditChange}
        handleEditSubmit={handleEditSubmit}
        passwordError={passwordError}
      />

      {/* Toast Notification */}
      <Toaster
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
        duration={5000}
        position="top-right"
      />

      {/* All Admins Management */}
      <div className="my-4">
        <h3 className="text-xl font-semibold mb-4">
          All Admins Management 
        </h3>

        {/* Super Admin Stats */}
        <div className="bg-white shadow rounded p-6 mb-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg p-4">
              <div className="text-lg font-bold text-orange-700">{allCompanies.length}</div>
              <div className="text-sm text-orange-800">Total Companies</div>
            </div>
            <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4">
              <div className="text-lg font-bold text-green-700">{companyAdminsCount}</div>
              <div className="text-sm text-green-800">TotalCompny Admins</div>
            </div>
            
            <div className="bg-purple-100 border-l-4 border-purple-500 rounded-lg p-4">
              <div className="text-lg font-bold text-purple-700">
                {superAdminsCount}
              </div>
              <div className="text-sm text-purple-800">Super Admins</div>
            </div>
            <div className="bg-indigo-100 border-l-4 border-indigo-500 rounded-lg p-4">
              <div className="text-lg font-bold text-indigo-700">{allUsers.length}</div>
              <div className="text-sm text-indigo-800">Total Users</div>
            </div>
          </div>
        </div>

        <AdminList />
      </div>

      
    </div>
  );
};

export default SuperAdminProfile;
