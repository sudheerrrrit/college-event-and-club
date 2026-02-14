import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import api from "../services/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [clubRequests, setClubRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const [usersRes, clubReqRes, analyticsRes] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/club-requests"),
      api.get("/admin/analytics"),
    ]);

    setUsers(usersRes.data);
    setClubRequests(clubReqRes.data);
    setAnalytics(analyticsRes.data);
  };

  useEffect(() => {
    load().catch(() => setError("Failed to load admin data"));
  }, []);

  const updateUser = async (id, role) => {
    await api.patch(`/admin/users/${id}`, { role });
    load();
  };

  const decideClub = async (id, action) => {
    await api.patch(`/admin/club-requests/${id}`, { action });
    load();
  };

  const exportCsv = async () => {
    try {
      const res = await api.get("/admin/export/registrations.csv", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "registrations.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("CSV export failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={exportCsv}>Export Registrations CSV</button>
      </div>
      {error && <p className="rounded bg-rose-100 p-2 text-sm text-rose-700">{error}</p>}

      {analytics && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="font-semibold">Summary</h2>
            <p className="text-sm">Upcoming Events: {analytics.summary.upcomingEvents}</p>
            <p className="text-sm">Total Registrations: {analytics.summary.totalRegistrations}</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-2 font-semibold">Student Count Per Club</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.studentsPerClub}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="studentCount" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow md:col-span-2">
            <h2 className="mb-2 font-semibold">Registration Trend (Last 30 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Pending Club Requests</h2>
        <div className="space-y-3">
          {clubRequests.map((club) => (
            <div key={club._id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{club.name} ({club.category})</p>
                <p className="text-sm text-slate-600">Leader: {club.leader?.name} ({club.leader?.email})</p>
              </div>
              <div className="space-x-2">
                <button className="rounded bg-emerald-600 px-3 py-1 text-white" onClick={() => decideClub(club._id, "approve")}>Approve</button>
                <button className="rounded bg-rose-600 px-3 py-1 text-white" onClick={() => decideClub(club._id, "reject")}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Manage Users</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
              <select className="rounded border p-1" value={user.role} onChange={(e) => updateUser(user._id, e.target.value)}>
                <option value="student">student</option>
                <option value="leader">leader</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
