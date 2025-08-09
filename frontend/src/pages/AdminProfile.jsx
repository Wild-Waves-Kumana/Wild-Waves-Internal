import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";   
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const { adminId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let adminId = null;
    try {
      const decoded = jwtDecode(token);
      adminId = decoded.id;
    } catch {
      setLoading(false);
      return;
    }

    //console.log("Admin ID:", adminId);

    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/${adminId}`);
        setAdmin(res.data);
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId]);

  if (loading) return <div>Loading...</div>;
  if (!admin) return <div>Admin not found.</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow rounded p-6">
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
  );
};

export default AdminProfile;