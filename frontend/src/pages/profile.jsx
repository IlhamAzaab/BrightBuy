
"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const assets = {
  default_profile: "/images/default.jpg",
};

const UserProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [profile, setProfile] = useState({});
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [Address, setAddress] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  // Fetch profile data
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios
      .get(`http://localhost:9000/api/profile/${userId}`)
      .then((res) => {
        const data = res.data;
        setProfile(data);
        setName(data.Name || "");
        setEmail(data.Email || "");
        setAddress(data.Address || "");
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  // Handle save changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!userId) return alert("User not found");

    // Validate passwords
    if (newPassword || confirmPassword || oldPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        return alert("Please fill all password fields to change your password");
      }
      if (newPassword !== confirmPassword) {
        return alert("New password and confirmation do not match");
      }
    }

    try {
      // Update profile info
      await axios.put(`http://localhost:9000/api/profile/${userId}`, {
        Name,
        Email,
        Address,
      });

      // Update password if filled
      if (oldPassword && newPassword) {
        await axios.put(`http://localhost:9000/api/profile/${userId}/password`, {
          oldPassword,
          newPassword,
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      // Upload photo if selected
      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);
        const res = await axios.post(
          `http://localhost:9000/api/profile/${userId}/photo`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setProfile(prev => ({ ...prev, image_URL: res.data.photo_URL}));
        setPhoto(null);
        setUser(prev => ({...prev,image_URL: res.data.photo_URL,}));
      }

      alert("Profile updated successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  if (!userId || loading) return <p>Loading user...</p>;

  return (
    <>
    <Navbar/>
    <div className="flex-1 min-h-screen flex items-center justify-center">
      <form onSubmit={handleSaveChanges} className="md:p-10 p-4 space-y-2 max-w-lg w-full">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-base font-medium">Profile Photo</p>
          <label htmlFor="profile-photo">
            <input
              type="file"
              id="profile-photo"
              hidden
              onChange={(e) => setPhoto(e.target.files[0])}
            />
            <img
              className="w-24 h-24 object-cover rounded-full border border-gray-300 cursor-pointer"
              src={photo ? URL.createObjectURL(photo) : profile.image_URL ? `http://localhost:9000${profile.image_URL}` : assets.default_profile}
              alt="Profile"
            />
          </label>

          {/* Conditionally render Remove Photo button */}
          {profile.image_URL && (
           <button
            type="button"
            className="mt-2 px-4 py-2 bg-orange-600 text-white font-small rounded hover:bg-orange-700"
            onClick={async () => {
             try {
              await axios.delete(`http://localhost:9000/api/profile/${userId}/photo`);
              setProfile({ ...profile, image_URL: null });
              alert("Profile photo removed");
             } catch (err) {
              console.error(err);
              alert("Error removing photo");
             }
            }}
           >
            Remove Photo
           </button>
         )}

        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="Name" className="text-base font-medium">Name</label>
          <input
            id="Name"
            type="text"
            className="outline-none py-2 px-3 rounded border border-gray-300 w-full bg-gray-100"
            value={Name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="Email" className="text-base font-medium">Email</label>
          <input
            id="Email"
            type="email"
            className="outline-none py-2 px-3 rounded border border-gray-300 w-full bg-gray-100"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Address (optional) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="Address" className="text-base font-medium">Address</label>
          <textarea
            id="Address"
            rows={3}
            className="outline-none py-2 px-3 rounded border border-gray-300 w-full resize-none bg-gray-100"
            value={Address}
            onChange={(e) => setAddress(e.target.value)}
          ></textarea>
        </div>

        {/* Passwords */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="old-password" className="text-base font-medium">Old Password</label>
              <input
                id="old-password"
                type="password"
                className="outline-none py-2 px-3 rounded border border-gray-300 w-full bg-gray-100"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="new-password" className="text-base font-medium">New Password</label>
              <input
                id="new-password"
                type="password"
                className="outline-none py-2 px-3 rounded border border-gray-300 w-full bg-gray-100"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-base font-medium">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              className="outline-none py-2 px-3 rounded border border-gray-300 w-full bg-gray-100"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Save Changes */}
        <button
          type="submit"
          className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded w-full hover:bg-orange-700"
        >
          Save Changes
        </button>
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default UserProfile;


