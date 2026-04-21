import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const formatRelativeTime = (value) => {
  const date = new Date(value);
  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const extractBudgetFromCoverLetter = (coverLetter = "") => {
  const match = coverLetter.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return match ? `$${Number(match[1]).toLocaleString()}` : "Not specified";
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

  const uniqueFreelancers = applicants.reduce((acc, application) => {
    const id = application.applicant?._id;
    if (!id || acc.some((item) => item._id === id)) {
      return acc;
    }
    const matchedSkills =
      jobs.find((job) => job.title === application.job?.title)?.skills?.slice(0, 4) || ["React", "Node.js"];
    acc.push({
      _id: id,
      name: application.applicant?.name || "Freelancer",
      email: application.applicant?.email || "Not available",
      resumeUrl: application.applicant?.resumeUrl || "",
      skills: matchedSkills,
      bio: "Experienced freelancer focused on shipping quality features with fast communication.",
    });
    return acc;
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: uniqueFreelancers.length + 1,
      icon: "👥",
      hint: "Freelancers + your team",
    },
    {
      title: "Total Jobs",
      value: jobs.length,
      icon: "📌",
      hint: "All posted opportunities",
    },
    {
      title: "Total Applications",
      value: applicants.length,
      icon: "🗂️",
      hint: "Across all job posts",
    },
    {
      title: "Active Jobs",
      value: jobs.filter((job) =>
        applicants.some((application) => application.job?._id === job._id && application.status !== "accepted")
      ).length,
      icon: "⚡",
      hint: "Open and in progress",
    },
  ];

  const recentActivity = applicants.slice(0, 5);

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
          {statCards.map((card) => (
            <article className="card feature-card stat-card" key={card.title}>
              <div className="stat-head">
                <span className="stat-icon" aria-hidden="true">
                  {card.icon}
                </span>
                <h4>{card.title}</h4>
              </div>
              <h3>{card.value}</h3>
              <p className="muted">{card.hint}</p>
            </article>
          ))}
        </section>

        <section className="card">
          <div className="section-head">
            <h3>Recent Activity</h3>
            <span className="muted">Latest applications from freelancers</span>
          </div>
          {!loading && !recentActivity.length && <p className="muted">No recent activity yet.</p>}
          <div className="activity-list">
            {!loading &&
              recentActivity.map((application) => (
                <article className="activity-row" key={application._id}>
                  <div>
                    <strong>{application.applicant?.name}</strong>
                    <p className="muted">
                      Applied to <strong>{application.job?.title}</strong>
                    </p>
                  </div>
                  <div className="activity-meta">
                    <span className={getStatusClass(application.status)}>
                      {statusLabel[application.status] || application.status}
                    </span>
                    <span className="muted">{formatRelativeTime(application.createdAt)}</span>
                  </div>
                </article>
              ))}
          </div>
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
          <h3>Jobs Table</h3>
          <div className="table-card card">
            {!loading && !jobs.length && !error && <p>No jobs posted yet.</p>}
            {!loading && Boolean(jobs.length) && (
              <div className="table-wrap">
                <table className="data-table jobs-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Budget</th>
                      <th>Posted By</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const hasAcceptedCandidate = applicants.some(
                        (application) => application.job?._id === job._id && application.status === "accepted"
                      );
                      return (
                        <tr key={job._id}>
                          <td>
                            <strong>{job.title}</strong>
                            <div className="muted">{job.location}</div>
                          </td>
                          <td>${job.budget.toLocaleString()}</td>
                          <td>You</td>
                          <td>
                            <span className={hasAcceptedCandidate ? "status-pill status-completed" : "status-pill status-active"}>
                              {hasAcceptedCandidate ? "Closed" : "Open"}
                            </span>
                          </td>
                          <td>
                            <div className="actions">
                              <Link className="btn btn-secondary btn-xs" to={`/jobs/${job._id}`}>
                                View
                              </Link>
                              <button className="btn btn-secondary btn-xs" type="button" disabled>
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3>Freelancers</h3>
          <div className="card-grid">
            {!loading &&
              uniqueFreelancers.map((freelancer) => (
                <article className="card freelancer-card interactive-card" key={freelancer._id}>
                  <div className="freelancer-head">
                    <div className="avatar-circle">{freelancer.name?.slice(0, 1) || "F"}</div>
                    <div>
                      <h4>{freelancer.name}</h4>
                      <p className="muted">{freelancer.email}</p>
                    </div>
                  </div>
                  <p className="muted">{freelancer.bio}</p>
                  <div className="tags-wrap">
                    {freelancer.skills.map((skill) => (
                      <span className="tag" key={`${freelancer._id}-${skill}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button className="btn btn-secondary btn-xs" type="button">
                    View Profile
                  </button>
                </article>
              ))}
            {!loading && !uniqueFreelancers.length && !error && <p>No freelancer profiles yet.</p>}
          </div>
        </section>

        <section>
          <h3>Applications Dashboard</h3>
          <div className="table-card card">
            {!loading && !applicants.length && !error && <p>No applications yet.</p>}
            {!loading && Boolean(applicants.length) && (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Freelancer</th>
                      <th>Job</th>
                      <th>Proposed Budget</th>
                      <th>Status</th>
                      <th>Actions</th>
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
                        <td>{extractBudgetFromCoverLetter(application.coverLetter)}</td>
                        <td>
                          <span className={getStatusClass(application.status)}>
                            {statusLabel[application.status] || application.status}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="btn btn-xs"
                              type="button"
                              disabled={application.status === "accepted"}
                              onClick={() => updateStatus(application._id, "accepted")}
                            >
                              Accept
                            </button>
                            <button
                              className="btn btn-secondary btn-xs"
                              type="button"
                              disabled={application.status === "rejected"}
                              onClick={() => updateStatus(application._id, "rejected")}
                            >
                              Reject
                            </button>
                            <select
                              className="compact-select"
                              value={application.status}
                              onChange={(event) => updateStatus(application._id, event.target.value)}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
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
