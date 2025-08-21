import React from 'react';

const UserList = ({
  users,
  companies,
  villas,
  loading,
  navigate,
}) => {
  // Helper to get company name by ID
  const getCompanyName = (companyId) => {
    if (!companyId) return 'N/A';
    const found = companies.find(
      (c) => c._id === companyId || c.companyId === companyId
    );
    return found ? found.companyName : 'N/A';
  };

  // Helper to get villa name by villaId
  const getVillaName = (villaId) => {
    if (!villaId) return 'N/A';
    const found = villas.find(
      (v) => v._id === villaId || v.villaId === villaId
    );
    return found ? found.villaName : 'N/A';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Users in Your Company</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Villa Name</th>
            <th className="border px-4 py-2">Access</th>
            <th className="border px-4 py-2">Check-In</th>
            <th className="border px-4 py-2">Check-Out</th>
            <th className="border px-4 py-2">Company</th>
            <th className="border px-4 py-2">Profile</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="border px-4 py-2">{u.username}</td>
              <td className="border px-4 py-2">{getVillaName(u.villaId)}</td>
              <td className="border px-4 py-2">
                <span className={`px-2 py-1 rounded ${u.access === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {u.access === true ? "Enabled" : "Disabled"}
                </span>
              </td>
              <td className="border px-4 py-2">
                {u.checkinDate ? new Date(u.checkinDate).toLocaleDateString() : 'N/A'}
              </td>
              <td className="border px-4 py-2">
                {u.checkoutDate ? new Date(u.checkoutDate).toLocaleDateString() : 'N/A'}
              </td>
              <td className="border px-4 py-2">
                {getCompanyName(u.companyId?._id || u.companyId)}
              </td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => navigate(`/user-profile/${u._id}`)}
                >
                  View Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <div className="mt-4 text-gray-500">No users found for your company.</div>}
    </div>
  );
};

export default UserList;