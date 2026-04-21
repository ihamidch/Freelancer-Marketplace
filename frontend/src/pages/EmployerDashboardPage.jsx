import { useEffect, useState } from "react";
import api from "../api/client";

const statusOptions = ["reviewing", "shortlisted", "rejected", "accepted"];
const statusLabel = {
  reviewing: "Pending",
  shortlisted: "Active",
  accepted: "Completed",
  rejected: "Rejected",
};

const getStatusClass = (status) => {
  if (status === "accepted") return "status-pill status-completed";
  if (status === "shortlisted") return "status-pill status-active";
  if (status === "reviewing") return "status-pill status-pending";
  if (status === "rejected") return "status-pill status-rejected";
  return "status-pill";
};

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
    <section className="dashboard-layout page-enter">
      <aside className="dashboard-sidebar card">
        <span className="pill">Employer Workspace</span>
        <h3>Client Flow</h3>
        <ul className="flow-list">
          <li>Post job</li>
          <li>View freelancers</li>
          <li>Hire freelancer</li>
        </ul>
        <p className="muted">Use this control center to run your complete hiring cycle.</p>
      </aside>

      <div className="stack">
        <div className="section-head">
          <div>
            <h2>Post jobs and manage applicants</h2>
            <p className="muted">SaaS-ready dashboard for startup hiring teams.</p>
          </div>
        </div>

        <section className="stats-grid">
          <article className="card feature-card">
            <h4>Total Jobs</h4>
            <h3>{jobs.length}</h3>
          </article>
          <article className="card feature-card">
            <h4>Total Applicants</h4>
            <h3>{applicants.length}</h3>
          </article>
          <article className="card feature-card">
            <h4>Pending</h4>
            <h3>{applicants.filter((item) => item.status === "reviewing").length}</h3>
          </article>
          <article className="card feature-card">
            <h4>Completed</h4>
            <h3>{applicants.filter((item) => item.status === "accepted").length}</h3>
          </article>
        </section>

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
        {loading && (
          <div className="card-grid">
            {[1, 2].map((item) => (
              <article className="card skeleton-card" key={item}>
                <div className="skeleton-line w-70"></div>
                <div className="skeleton-line w-45"></div>
                <div className="skeleton-line w-90"></div>
              </article>
            ))}
          </div>
        )}

        <section>
          <h3>Your Posted Jobs</h3>
          <div className="card-grid">
            {!loading &&
              jobs.map((job) => (
                <article className="card job-card interactive-card" key={job._id}>
                  <div className="job-header">
                    <h4>{job.title}</h4>
                    <span className="job-budget">${job.budget}</span>
                  </div>
                  <p className="job-meta">{job.location}</p>
                  <div className="tags-wrap">
                    {(job.skills?.length ? job.skills : ["General"]).slice(0, 5).map((skill) => (
                      <span className="tag" key={`${job._id}-${skill}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            {!loading && !jobs.length && !error && <p>No jobs posted yet.</p>}
          </div>
        </section>

        <section>
          <h3>Applicants</h3>
          <div className="table-card card">
            {!loading && !applicants.length && !error && <p>No applications yet.</p>}
            {!loading && Boolean(applicants.length) && (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Freelancer</th>
                      <th>Job</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((application) => (
                      <tr key={application._id}>
                        <td>
                          <strong>{application.applicant?.name}</strong>
                          <div className="muted">{application.applicant?.email}</div>
                        </td>
                        <td>
                          <strong>{application.job?.title}</strong>
                          <div className="muted">{application.applicant?.resumeUrl || "Resume not uploaded"}</div>
                        </td>
                        <td>
                          <span className={getStatusClass(application.status)}>
                            {statusLabel[application.status] || application.status}
                          </span>
                        </td>
                        <td>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default EmployerDashboardPage;
