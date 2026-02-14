import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-semibold">College Event & Club</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/clubs">Clubs</Link>
          <Link to="/events">Events</Link>
          {user && user.role === "student" && <Link to="/profile">My Registrations</Link>}
          {user && user.role === "leader" && <Link to="/leader">Leader Panel</Link>}
          {user && user.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/register" className="rounded bg-indigo-500 px-3 py-1">Sign Up</Link>}
          {user && (
            <button onClick={handleLogout} className="rounded bg-rose-500 px-3 py-1">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
