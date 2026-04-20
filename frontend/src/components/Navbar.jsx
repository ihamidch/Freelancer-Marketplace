import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-dot"></span> FreelanceHub
      </Link>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/jobs">Job Listings</NavLink>
        {!user && <NavLink to="/auth">Login/Signup</NavLink>}
        {user?.role === "employer" && <NavLink to="/dashboard/employer">Employer Dashboard</NavLink>}
        {user?.role === "job_seeker" && (
          <NavLink to="/dashboard/job-seeker">Job Seeker Dashboard</NavLink>
        )}
      </nav>
      <div className="nav-right">
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
          <Link className="btn" to="/auth">
            Get Started
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
