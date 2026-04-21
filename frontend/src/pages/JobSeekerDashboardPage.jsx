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

const JobSeekerDashboardPage = () => {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user, updateUser } = useAuth();

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
          <article className="card feature-card">
            <h4>Saved Jobs</h4>
            <h3>{savedJobs.length}</h3>
          </article>
          <article className="card feature-card">
            <h4>Applications</h4>
            <h3>{applications.length}</h3>
          </article>
          <article className="card feature-card">
            <h4>Pending</h4>
            <h3>{applications.filter((item) => item.status === "reviewing").length}</h3>
          </article>
          <article className="card feature-card">
            <h4>Completed</h4>
            <h3>{applications.filter((item) => item.status === "accepted").length}</h3>
          </article>
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
          <h3>Saved Jobs</h3>
          <div className="card-grid">
            {!loading &&
              savedJobs.map((job) => (
                <article className="card job-card interactive-card" key={job._id}>
                  <div className="job-header">
                    <h4>{job.title}</h4>
                    <span className="job-budget">${job.budget}</span>
                  </div>
                  <p className="job-meta">{job.company}</p>
                  <div className="tags-wrap">
                    {(job.skills?.length ? job.skills : ["General"]).slice(0, 5).map((skill) => (
                      <span className="tag" key={`${job._id}-${skill}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="actions">
                    <Link className="btn btn-secondary" to={`/jobs/${job._id}`}>
                      View Details
                    </Link>
                    <Link className="btn" to={`/jobs/${job._id}`}>
                      Apply Now
                    </Link>
                  </div>
                </article>
              ))}
            {!loading && !savedJobs.length && !error && <p>You have no saved jobs yet.</p>}
          </div>
        </section>

        <section>
          <h3>Application Status Tracking</h3>
          <div className="table-card card">
            {!loading && !applications.length && !error && <p>No applications submitted yet.</p>}
            {!loading && Boolean(applications.length) && (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application._id}>
                        <td>
                          <strong>{application.job?.title}</strong>
                        </td>
                        <td>{application.job?.company}</td>
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
