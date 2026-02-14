import { useEffect, useState } from "react";
import api from "../services/api";

const Profile = () => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/registrations/my")
      .then(({ data }) => setRows(data))
      .catch(() => setError("Failed to load registrations"));
  }, []);

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h1 className="mb-4 text-2xl font-bold">My Registered Events</h1>
      {error && <p className="mb-3 rounded bg-rose-100 p-2 text-sm text-rose-700">{error}</p>}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row._id} className="rounded border p-3">
            <h2 className="font-semibold">{row.event?.title}</h2>
            <p className="text-sm text-slate-600">{new Date(row.event?.date).toLocaleString()} | {row.event?.venue}</p>
            <p className="text-sm text-slate-600">Club: {row.event?.club?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
