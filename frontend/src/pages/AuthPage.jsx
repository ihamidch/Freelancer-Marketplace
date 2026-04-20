import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "job_seeker",
  });
  const [error, setError] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = mode === "login" ? await login(form) : await signup(form);
      if (payload.role === "employer") {
        navigate("/dashboard/employer");
      } else {
        navigate("/dashboard/job-seeker");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <section className="auth-card">
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <form className="stack-form" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="job_seeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </>
        )}
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button className="btn">{mode === "login" ? "Login" : "Create account"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <button
        className="btn btn-secondary"
        onClick={() => setMode((prev) => (prev === "login" ? "signup" : "login"))}
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
      </button>
    </section>
  );
};

export default AuthPage;
