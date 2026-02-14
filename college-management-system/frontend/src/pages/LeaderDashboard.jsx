import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const LeaderDashboard = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [clubForm, setClubForm] = useState({ name: "", description: "", category: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "", venue: "", category: "", capacity: 200, club: "", poster: null });
  const [error, setError] = useState("");

  const myClub = useMemo(
    () => clubs.find((c) => String(c.leader?._id) === String(user.id || user._id)),
    [clubs, user]
  );

  const load = async () => {
    const [clubRes, eventRes] = await Promise.all([api.get("/clubs"), api.get("/events")]);
    setClubs(clubRes.data);
    setEvents(eventRes.data);
  };

  useEffect(() => {
    load().catch(() => setError("Failed to load leader data"));
  }, []);

  useEffect(() => {
    if (myClub) {
      setClubForm({ name: myClub.name, description: myClub.description, category: myClub.category });
      setEventForm((prev) => ({ ...prev, club: myClub._id }));
    }
  }, [myClub]);

  const updateClub = async (e) => {
    e.preventDefault();
    if (!myClub) return;
    try {
      await api.put(`/clubs/${myClub._id}`, clubForm);
      alert("Club updated");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update club");
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(eventForm).forEach(([k, v]) => {
        if (v !== null && v !== "") formData.append(k, v);
      });
      await api.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Event created");
      setEventForm({ title: "", description: "", date: "", venue: "", category: "", capacity: 200, club: myClub?._id || "", poster: null });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    }
  };

  const quickEditEvent = async (event) => {
    const title = window.prompt("Update event title", event.title);
    if (!title) return;
    try {
      await api.put(`/events/${event._id}`, { title });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Edit failed");
    }
  };

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const myEvents = events.filter((e) => String(e.club?._id) === String(myClub?._id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Club Leader Dashboard</h1>
      {error && <p className="rounded bg-rose-100 p-2 text-sm text-rose-700">{error}</p>}

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Manage Club</h2>
        {!myClub ? (
          <p className="text-sm text-slate-600">No approved club assigned yet. Submit club request first.</p>
        ) : (
          <form className="space-y-3" onSubmit={updateClub}>
            <input className="w-full rounded border p-2" value={clubForm.name} onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })} required />
            <input className="w-full rounded border p-2" value={clubForm.category} onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })} required />
            <textarea className="w-full rounded border p-2" rows="4" value={clubForm.description} onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })} required />
            <button className="rounded bg-indigo-600 px-4 py-2 text-white" type="submit">Update Club</button>
          </form>
        )}
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Create Event</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={createEvent}>
          <input className="rounded border p-2" placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
          <input className="rounded border p-2" placeholder="Venue" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} required />
          <input className="rounded border p-2" placeholder="Category" value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })} required />
          <input className="rounded border p-2" type="datetime-local" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} required />
          <input className="rounded border p-2" type="number" min="1" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} />
          <input className="rounded border p-2" type="file" accept="image/*" onChange={(e) => setEventForm({ ...eventForm, poster: e.target.files?.[0] || null })} />
          <textarea className="rounded border p-2 md:col-span-2" rows="4" placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} required />
          <button className="rounded bg-emerald-600 px-4 py-2 text-white md:col-span-2" type="submit">Create Event</button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">My Events</h2>
        <div className="space-y-3">
          {myEvents.map((event) => (
            <div key={event._id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-slate-600">{new Date(event.date).toLocaleString()} | {event.venue}</p>
              </div>
              <div className="space-x-2">
                <button className="rounded bg-amber-500 px-3 py-1 text-sm text-white" onClick={() => quickEditEvent(event)}>Edit</button>
                <button className="rounded bg-rose-600 px-3 py-1 text-sm text-white" onClick={() => deleteEvent(event._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LeaderDashboard;
