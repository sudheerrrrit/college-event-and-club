import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Clubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [requestForm, setRequestForm] = useState({ name: "", description: "", category: "" });

  const loadClubs = async () => {
    const { data } = await api.get("/clubs", { params: { search: query, category } });
    setClubs(data);
  };

  useEffect(() => {
    loadClubs().catch(() => setError("Failed to load clubs"));
  }, []);

  const requestClub = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/clubs/request", requestForm);
      setRequestForm({ name: "", description: "", category: "" });
      alert("Club request submitted for admin approval");
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-4 shadow">
        <h1 className="mb-3 text-2xl font-bold">Clubs</h1>
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded border p-2" placeholder="Search clubs" value={query} onChange={(e) => setQuery(e.target.value)} />
          <input className="rounded border p-2" placeholder="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <button className="rounded bg-slate-900 p-2 text-white" onClick={loadClubs}>Apply</button>
        </div>
      </div>

      {error && <p className="rounded bg-rose-100 p-2 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {clubs.map((club) => (
          <article key={club._id} className="rounded-xl bg-white p-4 shadow">
            <h2 className="text-lg font-semibold">{club.name}</h2>
            <p className="text-sm text-slate-600">{club.category}</p>
            <p className="mt-2 text-sm">{club.description}</p>
            <p className="mt-2 text-xs text-slate-500">Leader: {club.leader?.name || "N/A"}</p>
          </article>
        ))}
      </div>

      {user && user.role !== "admin" && (
        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-3 text-xl font-semibold">Request New Club</h2>
          <form className="space-y-3" onSubmit={requestClub}>
            <input className="w-full rounded border p-2" placeholder="Club name" value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} required />
            <input className="w-full rounded border p-2" placeholder="Category" value={requestForm.category} onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })} required />
            <textarea className="w-full rounded border p-2" rows="4" placeholder="Description" value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} required />
            <button className="rounded bg-indigo-600 px-4 py-2 text-white" type="submit">Submit Request</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Clubs;
