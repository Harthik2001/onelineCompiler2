import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Layout from "./Layout";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    console.log("Profile useEffect RUNNING...");
    console.log("AuthContext user object:", user);

    const fetchProfile = async () => {
      console.log("📥 fetchProfile FUNCTION RUNNING...");

      if (authLoading) {
        console.log("⏳ AuthContext is still loading... Deferring profile fetch.");
        return;
      }

      if (!user?.token) {
        console.error(" Token is MISSING in Profile.js!", { user });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        console.log("🔗 Fetching profile from API...");
        const response = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: `Bearer ${user.token}` },
          withCredentials: true,
        });

        console.log("✅ Profile Data:", response.data);
        setUserProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  if (loading) {
    return <Layout><div className="p-4">Loading profile...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="p-4 text-red-500">{error}</div></Layout>;
  }

  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
      <div className="border p-4 rounded">
        <p><strong>Full Name:</strong> {userProfile.fullname}</p>
        <p><strong>Email:</strong> {userProfile.email}</p>
      </div>
    </Layout>
  );
};

export default Profile;
