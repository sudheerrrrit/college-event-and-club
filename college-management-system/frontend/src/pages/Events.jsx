import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", club: "", dateFrom: "", dateTo: "" });
  const [error, setError] = useState("");

  const loadData = async () => {
    const [eventsRes, clubsRes] = await Promise.all([
      api.get("/events", { params: filters }),
      api.get("/clubs"),
    ]);
    setEvents(eventsRes.data);
    setClubs(clubsRes.data);
  };

  useEffect(() => {
    loadData().catch(() => setError("Failed to load events"));
  }, []);

  const register = async (eventId) => {
    try {
      await api.post(`/registrations/events/${eventId}/register`);
      alert("Registered successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-4 shadow">
        <h1 className="mb-3 text-2xl font-bold">Events</h1>
        <div className="grid gap-3 md:grid-cols-5">
          <input className="rounded border p-2" placeholder="Search events" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <input className="rounded border p-2" placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
          <select className="rounded border p-2" value={filters.club} onChange={(e) => setFilters({ ...filters, club: e.target.value })}>
            <option value="">All Clubs</option>
            {clubs.map((club) => (
              <option key={club._id} value={club._id}>{club.name}</option>
            ))}
          </select>
          <input className="rounded border p-2" type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
          <input className="rounded border p-2" type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        </div>
        <button className="mt-3 rounded bg-slate-900 px-4 py-2 text-white" onClick={loadData}>Apply Filters</button>
      </div>

      {error && <p className="rounded bg-rose-100 p-2 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <article key={event._id} className="overflow-hidden rounded-xl bg-white shadow">
            {event.posterImage && (
              <img
                className="h-48 w-full object-cover"
                src={`${import.meta.env.VITE_BACKEND_URL}${event.posterImage}`}
                alt={event.title}
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold">{event.title}</h2>
              <p className="text-sm text-slate-600">{new Date(event.date).toLocaleString()} | {event.venue}</p>
              <p className="text-sm text-slate-600">Club: {event.club?.name}</p>
              <p className="mt-2 text-sm">{event.description}</p>
              {user?.role === "student" && (
                <button className="mt-3 rounded bg-emerald-600 px-3 py-1 text-white" onClick={() => register(event._id)}>
                  Register
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Events;
