import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const payload =
        mode === "login"
          ? await login({ email: form.email, password: form.password })
          : await signup({
              name: form.name,
              email: form.email,
              password: form.password,
              role: form.role,
            });

      const nextPath = new URLSearchParams(location.search).get("next");
      if (nextPath) {
        addToast("Authentication successful", "success");
        navigate(nextPath);
        return;
      }

      if (payload.role === "employer") {
        addToast("Welcome back", "success");
        navigate("/dashboard/employer");
      } else {
        addToast("Welcome back", "success");
        navigate("/dashboard/job-seeker");
      }
    } catch (err) {
      const nextError = err.response?.data?.message || "Authentication failed";
      setError(nextError);
      addToast(nextError, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell page-enter">
      <article className="auth-intro card">
        <span className="pill">{mode === "login" ? "Welcome back" : "Create your account"}</span>
        <h2>
          {mode === "login"
            ? "Login to continue your freelance journey"
            : "Join as employer or job seeker"}
        </h2>
        <p>
          Manage projects, applications, and hiring in one platform with role-based dashboards and
          secure JWT authentication.
        </p>
        <div className="flow-grid">
          <article className="card flow-card">
            <h3>Client Flow</h3>
            <ol className="flow-list">
              <li>Post job</li>
              <li>View freelancers</li>
              <li>Hire freelancer</li>
            </ol>
          </article>
          <article className="card flow-card">
            <h3>Freelancer Flow</h3>
            <ol className="flow-list">
              <li>Browse jobs</li>
              <li>Apply for job</li>
              <li>Get hired</li>
            </ol>
          </article>
        </div>
      </article>

      <article className="auth-card">
        <h3>{mode === "login" ? "Login" : "Sign Up"}</h3>
        <form className="stack-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="job_seeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
            </>
          )}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            minLength={6}
            required
          />
          {mode === "signup" && (
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              minLength={6}
              required
            />
          )}
          <button className="btn" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        <button
          className="btn btn-secondary"
          onClick={() => setMode((prev) => (prev === "login" ? "signup" : "login"))}
          disabled={loading}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </article>
    </section>
  );
};

export default AuthPage;
