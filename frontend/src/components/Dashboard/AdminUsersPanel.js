// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './AdminUsersPanel.css';
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';

// // ✅ Axios setup (with credentials)
// axios.defaults.withCredentials = true;

// const AdminUsersPanel = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [error, setError] = useState('');

//   const { user: loggedInUser } = useSelector((state) => state.auth);
//   const token = loggedInUser?.token;

//   // 🔹 GET ALL USERS
//   const fetchAllUsers = async () => {
//     try {
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       };

//       const { data } = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/v1/admin/users`,
//         config
//       );
//       setUsers(data.users);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error fetching users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 GET SINGLE USER
//   const fetchSingleUser = async (id) => {
//     try {
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       };

//       const { data } = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/v1/admin/user/${id}`,
//         config
//       );
//       setSelectedUser(data.user);
//     } catch (err) {
//       alert('Failed to fetch single user');
//     }
//   };

//   // 🔹 UPDATE USER ROLE
//   const updateUserRole = async (id, role) => {
//     try {
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       };

//       await axios.put(
//         `${process.env.REACT_APP_API_URL}/api/v1/admin/user/${id}`,
//         { role },
//         config
//       );
//       alert('✅ Role updated successfully');
//       fetchAllUsers();
//     } catch (err) {
//       alert('❌ Failed to update role');
//     }
//   };

//   // 🔹 DELETE USER
//   const deleteUser = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this user?')) return;
//     try {
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       };

//       await axios.delete(
//         `${process.env.REACT_APP_API_URL}/api/v1/admin/user/${id}`,
//         config
//       );
//       alert('🗑️ User deleted');
//       fetchAllUsers();
//     } catch (err) {
//       alert('❌ Failed to delete user');
//     }
//   };

//   useEffect(() => {
//     fetchAllUsers();
//   }, []);

//   return (
//     <div style={{ padding: 20 }}>
//       <div style={{ marginBottom: '20px' }}>
//         <Link to="/dashboard" className="back-btn">
//           ⬅️ Back to Dashboard
//         </Link>
//       </div>

//       <h2>🔐 Admin Panel - Manage Users</h2>

//       {token ? null : (
//         <p style={{ color: 'red' }}>
//           ❌ Token not found. Please log in again.
//         </p>
//       )}

//       {loggedInUser && (
//         <div
//           style={{
//             marginBottom: '20px',
//             background: '#e9f5ff',
//             padding: '10px',
//             borderRadius: '8px',
//           }}
//         >
//           <h3>✅ Logged In User:</h3>
//           <p>
//             <strong>ID:</strong> {loggedInUser._id}
//           </p>
//           <p>
//             <strong>Name:</strong> {loggedInUser.name}
//           </p>
//           <p>
//             <strong>Email:</strong> {loggedInUser.email}
//           </p>
//           <p>
//             <strong>Role:</strong> {loggedInUser.role}
//           </p>
//         </div>
//       )}

//       {loading ? (
//         <p>Loading users...</p>
//       ) : error ? (
//         <p style={{ color: 'red' }}>{error}</p>
//       ) : (
//         <table border="1" cellPadding="8" cellSpacing="0" width="100%">
//           <thead style={{ backgroundColor: '#eee' }}>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Role</th>
//               <th>Change Role</th>
//               <th>View</th>
//               <th>Delete</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((u) => (
//               <tr key={u._id}>
//                 <td>{u._id}</td>
//                 <td>{u.name}</td>
//                 <td>{u.email}</td>
//                 <td>{u.role}</td>
//                 <td>
//                   <select
//                     value={u.role}
//                     onChange={(e) => updateUserRole(u._id, e.target.value)}
//                   >
//                     <option value="user">User</option>
//                     <option value="admin">Admin</option>
//                   </select>
//                 </td>
//                 <td>
//                   <button onClick={() => fetchSingleUser(u._id)}>Single</button>
//                 </td>
//                 <td>
//                   <button
//                     onClick={() => deleteUser(u._id)}
//                     style={{ color: 'red' }}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {selectedUser && (
//         <div style={{ marginTop: 20, background: '#f7f7f7', padding: 10 }}>
//           <h3>👤 Single User Details:</h3>
//           <p>
//             <strong>ID:</strong> {selectedUser._id}
//           </p>
//           <p>
//             <strong>Name:</strong> {selectedUser.name}
//           </p>
//           <p>
//             <strong>Email:</strong> {selectedUser.email}
//           </p>
//           <p>
//             <strong>Role:</strong> {selectedUser.role}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminUsersPanel;



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminUsersPanel.css';
import { Link } from 'react-router-dom';

// ✅ Axios setup (with credentials)
axios.defaults.withCredentials = true;

const AdminUsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');

  // 🔹 GET ALL USERS
  const fetchAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/users`
      );
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 GET SINGLE USER
  const fetchSingleUser = async (id) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/user/${id}`
      );
      setSelectedUser(data.user);
    } catch (err) {
      alert('Failed to fetch single user');
    }
  };

  // 🔹 UPDATE USER ROLE
  const updateUserRole = async (id, role) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/user/${id}`,
        { role }
      );
      alert('✅ Role updated successfully');
      fetchAllUsers();
    } catch (err) {
      alert('❌ Failed to update role');
    }
  };

  // 🔹 DELETE USER
  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/user/${id}`
      );
      alert('🗑️ User deleted');
      fetchAllUsers();
    } catch (err) {
      alert('❌ Failed to delete user');
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard" className="back-btn">
          ⬅️ Back to Dashboard
        </Link>
      </div>

      <h2>🔐 Admin Panel - Manage Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead style={{ backgroundColor: '#eee' }}>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Change Role</th>
              <th>View</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u._id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => updateUserRole(u._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => fetchSingleUser(u._id)}>Single</button>
                </td>
                <td>
                  <button
                    onClick={() => deleteUser(u._id)}
                    style={{ color: 'red' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <div style={{ marginTop: 20, background: '#f7f7f7', padding: 10 }}>
          <h3>👤 Single User Details:</h3>
          <p>
            <strong>ID:</strong> {selectedUser._id}
          </p>
          <p>
            <strong>Name:</strong> {selectedUser.name}
          </p>
          <p>
            <strong>Email:</strong> {selectedUser.email}
          </p>
          <p>
            <strong>Role:</strong> {selectedUser.role}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPanel;
