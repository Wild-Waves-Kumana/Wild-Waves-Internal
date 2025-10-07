import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import VillaList from "../components/lists/VillaList";
import EditAdminModal from "../components/modals/EditAdminModal";

const CompanyProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherAdmins, setOtherAdmins] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { adminId } = useParams();


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let adminIdLocal = null;
    try {
      const decoded = jwtDecode(token);
      adminIdLocal = decoded.id;
    } catch {
      setLoading(false);
      return;
    }

    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`/api/admin/${adminIdLocal}`);
        setAdmin(res.data);

        // Fetch other admins in the same company
        const companyId = res.data.companyId?._id || res.data.companyId;
        if (companyId) {
          const adminsRes = await axios.get("/api/admin/all");
          const filteredAdmins = adminsRes.data.filter(
            (a) =>
              (a.companyId === companyId || a.companyId?._id === companyId) &&
              a._id !== adminIdLocal
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
      password: "",
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log("Updating admin with ID:", admin._id); // <-- Add this line
    try {
      await axios.put(`/api/admin/${admin._id}`, editForm);
      setAdmin((prev) => ({
        ...prev,
        username: editForm.username,
        email: editForm.email,
      }));
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update admin details.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!admin) return <div>Admin not found.</div>;

  return (
    <div className="mx-auto">
      <div className="bg-white shadow rounded p-6 mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-4">Admin Profile</h2>
          <div className="mb-2"><strong>Username:</strong> {admin.username}</div>
          <div className="mb-2"><strong>Email:</strong> {admin.email}</div>
          <div className="mb-2">
            <strong>Company:</strong>{" "}
            {admin.companyId && typeof admin.companyId === "object"
              ? `${admin.companyId.companyName} (${admin.companyId.companyId || admin.companyId._id})`
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
      />

      {/* Other admins in the same company */}
      {otherAdmins.length > 0 && (
        <div className="bg-white shadow rounded p-6 mb-8">
          <h3 className="text-xl font-semibold mb-2">Other Admins in Your Company</h3>
          <ul className="list-disc pl-6">
            {otherAdmins.map((a) => (
              <li key={a._id} className="mb-1">
                <span className="font-medium">{a.username}</span> — <span className="text-blue-700">{a.email}</span>
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

export default CompanyProfile;