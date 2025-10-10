import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import VillaList from "../components/lists/VillaList";
import EditAdminModal from "../components/modals/EditAdminModal";
import Toaster from "../components/common/Toaster";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherAdmins, setOtherAdmins] = useState([]);
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
  const { adminId } = useParams();

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    if (!adminId) return;
    setLoading(true);

    const fetchAdmin = async () => {
      try {
        // Fetch the admin by adminId from URL
        const res = await axios.get(`/api/admin/${adminId}`);
        setAdmin(res.data);

        // Fetch other admins in the same company
        const companyId = res.data.companyId?._id || res.data.companyId;
        if (companyId) {
          const adminsRes = await axios.get("/api/admin/all");
          const filteredAdmins = adminsRes.data.filter(
            (a) =>
              (a.companyId === companyId || a.companyId?._id === companyId) &&
              a._id !== adminId
          );
          setOtherAdmins(filteredAdmins);
        } else {
          setOtherAdmins([]);
        }
      } catch {
        setAdmin(null);
        setOtherAdmins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId]);

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

  if (loading) return <div>Loading...</div>;
  if (!admin) return <div>Admin not found.</div>;

  return (
    <div className="mx-auto">
      <div className="bg-white shadow rounded p-6 mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-4">Admin Profile</h2>
          <div className="mb-2">
            <strong>Username:</strong> {admin.username}
          </div>
          <div className="mb-2">
            <strong>Email:</strong> {admin.email}
          </div>
          <div className="mb-2">
            <strong>Company:</strong>{" "}
            {admin.companyId && typeof admin.companyId === "object"
              ? `${admin.companyId.companyName} (${
                  admin.companyId.companyId || admin.companyId._id
                })`
              : admin.companyId || "N/A"}
          </div>
        </div>
        <div className="flex flex-col gap-2 ml-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleEditClick}
          >
            Edit
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={() => alert("Delete functionality coming soon!")}
          >
            Delete
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

      {/* Other admins in the same company */}
      {otherAdmins.length > 0 && (
        <div className="bg-white shadow rounded p-6 mb-8">
          <h3 className="text-xl font-semibold mb-2">
            Other Admins in Your Company
          </h3>
          <ul className="list-disc pl-6">
            {otherAdmins.map((a) => (
              <li key={a._id} className="mb-1">
                <span className="font-medium">{a.username}</span> —{" "}
                <span className="text-blue-700">{a.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Villas for this admin's company */}
      <VillaList companyId={admin.companyId?._id || admin.companyId} />
    </div>
  );
};

export default AdminProfile;