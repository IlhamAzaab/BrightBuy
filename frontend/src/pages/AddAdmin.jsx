import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const AddAdmin = () => {
  const { user, token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:9000/addadmin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [token]);

  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    try {
      await axios.put(
        `http://localhost:9000/addadmin/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI immediately
      setUsers(users.map(u =>
        u.User_ID === id ? { ...u, Role: newRole } : u
      ));
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  if (!user || user.role !== "admin") {
    return <p className="text-center text-red-500">Access denied. Admins only.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add admins</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.User_ID} className="text-center">
              <td className="p-2 border">{u.User_ID}</td>
              <td className="p-2 border">{u.Name}</td>
              <td className="p-2 border">{u.Email}</td>
              <td className="p-2 border">
                {u.User_ID !== user.id && (
                  <button
                    onClick={() => handleRoleToggle(u.User_ID, u.Role)}
                    className={`px-3 py-1 rounded ${
                      u.Role === "admin"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                  >
                    {u.Role === "admin" ? "Remove as Admin" : "Add as Admin"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AddAdmin;
