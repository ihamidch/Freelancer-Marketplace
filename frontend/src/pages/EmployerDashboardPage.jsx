import { useEffect, useState } from "react";
import api from "../api/client";

const statusOptions = ["reviewing", "shortlisted", "rejected", "accepted"];

const EmployerDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    budget: "",
    skills: "",
    employmentType: "contract",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setError("");
    setLoading(true);
    try {
      const [jobsResponse, applicantsResponse] = await Promise.all([
        api.get("/jobs/dashboard/employer"),
        api.get("/applications/employer/applicants"),
      ]);
      setJobs(jobsResponse.data);
      setApplicants(applicantsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  const handlePostJob = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post("/jobs", {
        ...form,
        budget: Number(form.budget),
        skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setMessage("Job posted successfully.");
      setForm({
        title: "",
        company: "",
        description: "",
        location: "",
        budget: "",
        skills: "",
        employmentType: "contract",
      });
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not post job.");
    }
  };

  const updateStatus = async (applicationId, status) => {
    setMessage("");
    setError("");
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      setMessage("Application status updated.");
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update application status.");
    }
  };

  return (
    <section className="stack">
      <div className="section-head">
        <div>
          <span className="pill">Employer Workspace</span>
          <h2>Post jobs and manage applicants</h2>
        </div>
      </div>

      <form className="grid-form card filter-card" onSubmit={handlePostJob}>
        <input
          placeholder="Job title"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
        <input
          placeholder="Company"
          value={form.company}
          onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
          required
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
          required
        />
        <input
          placeholder="Budget"
          type="number"
          value={form.budget}
          onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
          required
        />
        <input
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={(event) => setForm((prev) => ({ ...prev, skills: event.target.value }))}
        />
        <select
          value={form.employmentType}
          onChange={(event) => setForm((prev) => ({ ...prev, employmentType: event.target.value }))}
        >
          <option value="contract">Contract</option>
          <option value="part-time">Part-time</option>
          <option value="full-time">Full-time</option>
        </select>
        <textarea
          placeholder="Job description"
          rows={4}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          required
        />
        <button className="btn">Post Job</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading dashboard...</p>}

      <section>
        <h3>Your Posted Jobs</h3>
        <div className="card-grid">
          {!loading &&
            jobs.map((job) => (
              <article className="card job-card" key={job._id}>
                <div className="job-header">
                  <h4>{job.title}</h4>
                  <span className="job-budget">${job.budget}</span>
                </div>
                <p className="job-meta">{job.location}</p>
              </article>
            ))}
          {!loading && !jobs.length && !error && <p>No jobs posted yet.</p>}
        </div>
      </section>

      <section>
        <h3>Applicants</h3>
        <div className="card-grid">
          {!loading &&
            applicants.map((application) => (
              <article className="card" key={application._id}>
              <p>
                <strong>{application.applicant?.name}</strong> applied for{" "}
                <strong>{application.job?.title}</strong>
              </p>
              <p className="muted">Email: {application.applicant?.email}</p>
              <p className="muted">Resume: {application.applicant?.resumeUrl || "Not uploaded"}</p>
              <p>Status: <span className="status-pill">{application.status}</span></p>
              <select
                value={application.status}
                onChange={(event) => updateStatus(application._id, event.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </article>
            ))}
          {!loading && !applicants.length && !error && <p>No applications yet.</p>}
        </div>
      </section>
    </section>
  );
};

export default EmployerDashboardPage;
