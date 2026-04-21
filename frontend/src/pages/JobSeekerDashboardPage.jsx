import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

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

const JobSeekerDashboardPage = () => {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user, updateUser } = useAuth();

  const statCards = [
    {
      title: "Saved Jobs",
      value: savedJobs.length,
      icon: "📌",
      hint: "Bookmarked opportunities",
    },
    {
      title: "Total Applications",
      value: applications.length,
      icon: "🗂️",
      hint: "Submitted proposals",
    },
    {
      title: "Pending Reviews",
      value: applications.filter((item) => item.status === "reviewing" || item.status === "applied").length,
      icon: "⏳",
      hint: "Awaiting client response",
    },
    {
      title: "Accepted",
      value: applications.filter((item) => item.status === "accepted").length,
      icon: "✅",
      hint: "Successful hires",
    },
  ];

  const recentActivity = applications.slice(0, 5);

  const fetchData = async () => {
    setError("");
    setLoading(true);
    try {
      const applicationsResponse = await api.get("/applications/me");
      setApplications(applicationsResponse.data);

      const savedIds = user?.savedJobs || [];
      const jobs = await Promise.all(
        savedIds.map((jobId) =>
          api
            .get(`/jobs/${jobId}`)
            .then((res) => res.data)
            .catch(() => null)
        )
      );
      setSavedJobs(jobs.filter(Boolean));
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResumeUpload = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!resume) return;
    const formData = new FormData();
    formData.append("resume", resume);

    try {
      const { data } = await api.post("/applications/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateUser({ resumeUrl: data.resumeUrl });
      setMessage("Resume uploaded successfully.");
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Could not upload resume.");
    }
  };

  return (
    <section className="dashboard-layout page-enter">
      <aside className="dashboard-sidebar card">
        <span className="pill">Freelancer Workspace</span>
        <h3>Freelancer Flow</h3>
        <ul className="flow-list">
          <li>Browse jobs</li>
          <li>Apply for job</li>
          <li>Get hired</li>
        </ul>
        <p className="muted">Track saved jobs, upload profile assets, and monitor hiring progress.</p>
      </aside>

      <div className="stack">
        <div className="section-head">
          <div>
            <h2>Track applications and manage your profile</h2>
            <p className="muted">Everything needed to convert opportunities into offers.</p>
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
            <span className="muted">Your latest application updates</span>
          </div>
          {!loading && !recentActivity.length && <p className="muted">No recent activity yet.</p>}
          <div className="activity-list">
            {!loading &&
              recentActivity.map((application) => (
                <article className="activity-row" key={application._id}>
                  <div>
                    <strong>{application.job?.title}</strong>
                    <p className="muted">{application.job?.company}</p>
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

        <form className="stack-form card filter-card" onSubmit={handleResumeUpload}>
          <label>Upload Resume</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setResume(event.target.files[0])} />
          <button className="btn">Upload Resume</button>
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
        {user?.resumeUrl && <p className="muted">Current resume path: {user.resumeUrl}</p>}

        <section>
          <h3>Saved Jobs Table</h3>
          <div className="table-card card">
            {!loading && !savedJobs.length && !error && <p>You have no saved jobs yet.</p>}
            {!loading && Boolean(savedJobs.length) && (
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
                    {savedJobs.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <strong>{job.title}</strong>
                          <div className="muted">{job.location}</div>
                        </td>
                        <td>${job.budget.toLocaleString()}</td>
                        <td>{job.company}</td>
                        <td>
                          <span className="status-pill status-active">Open</span>
                        </td>
                        <td>
                          <div className="actions">
                            <Link className="btn btn-secondary btn-xs" to={`/jobs/${job._id}`}>
                              View
                            </Link>
                            <Link className="btn btn-xs" to={`/jobs/${job._id}`}>
                              Apply
                            </Link>
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

        <section>
          <h3>Applications Dashboard</h3>
          <div className="table-card card">
            {!loading && !applications.length && !error && <p>No applications submitted yet.</p>}
            {!loading && Boolean(applications.length) && (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Freelancer</th>
                      <th>Job title</th>
                      <th>Company</th>
                      <th>Proposed Budget</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application._id}>
                        <td>
                          <strong>{user?.name || "You"}</strong>
                        </td>
                        <td>
                          <strong>{application.job?.title}</strong>
                        </td>
                        <td>{application.job?.company}</td>
                        <td>{extractBudgetFromCoverLetter(application.coverLetter)}</td>
                        <td>
                          <span className={getStatusClass(application.status)}>
                            {statusLabel[application.status] || application.status}
                          </span>
                        </td>
                        <td>{new Date(application.createdAt).toLocaleDateString()}</td>
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

export default JobSeekerDashboardPage;
