// src/pages/dashboards/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/admin/overview").then(({data}) => setStats(data));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>
      {stats ? (
        <ul>
          <li>Total Users: {stats.totalUsers}</li>
          <li>Total Donations: {stats.totalDonations}</li>
          <li>Delivered: {stats.delivered}</li>
        </ul>
      ) : <p>Loading…</p>}
    </div>
  );
}
