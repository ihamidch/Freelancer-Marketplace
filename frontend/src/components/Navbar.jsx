import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-dot"></span> FreelanceHub
      </Link>
      <button className="menu-toggle btn btn-secondary" onClick={() => setMenuOpen((prev) => !prev)}>
        {menuOpen ? "Close" : "Menu"}
      </button>
      <nav className={`top-nav ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={closeMenu}>
          Home
        </NavLink>
        <NavLink to="/jobs" onClick={closeMenu}>
          Job Listings
        </NavLink>
        {!user && (
          <NavLink to="/auth" onClick={closeMenu}>
            Login/Signup
          </NavLink>
        )}
        {user?.role === "employer" && (
          <NavLink to="/dashboard/employer" onClick={closeMenu}>
            Employer Dashboard
          </NavLink>
        )}
        {user?.role === "job_seeker" && (
          <NavLink to="/dashboard/job-seeker" onClick={closeMenu}>
            Job Seeker Dashboard
          </NavLink>
        )}
      </nav>
      <div className={`nav-right ${menuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <span className="welcome">
              Hi, {user.name} <small className="muted-inline">({user.role === "employer" ? "Employer" : "Job Seeker"})</small>
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="btn" to="/auth" onClick={closeMenu}>
            Get Started
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
