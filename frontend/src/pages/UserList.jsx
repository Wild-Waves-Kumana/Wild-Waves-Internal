import React, { useEffect, useState } from "react";
import axios from "axios";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Adjust the API endpoint as needed
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User List</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Room Name</th>
            <th className="border px-4 py-2">Room ID</th>
            <th className="border px-4 py-2">Username</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="border px-4 py-2">{u.roomname}</td>
              <td className="border px-4 py-2">{u.roomid}</td>
              <td className="border px-4 py-2">{u.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;