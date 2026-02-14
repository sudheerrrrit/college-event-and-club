const Home = () => {
  return (
    <div className="space-y-4 rounded-xl bg-white p-8 shadow">
      <h1 className="text-3xl font-bold text-slate-900">College Event & Club Management System</h1>
      <p className="text-slate-600">
        Discover clubs, join events, manage communities, and track campus engagement with role-based dashboards.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <h2 className="font-semibold">Students</h2>
          <p className="text-sm text-slate-600">Explore clubs, filter events, and register instantly.</p>
        </div>
        <div className="rounded border p-4">
          <h2 className="font-semibold">Club Leaders</h2>
          <p className="text-sm text-slate-600">Create events, upload posters, and update club profiles.</p>
        </div>
        <div className="rounded border p-4">
          <h2 className="font-semibold">Admins</h2>
          <p className="text-sm text-slate-600">Approve clubs, manage users, and analyze participation trends.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
