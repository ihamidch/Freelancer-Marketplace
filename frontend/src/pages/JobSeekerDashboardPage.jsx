import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

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
    <section className="stack">
      <div className="section-head">
        <div>
          <span className="pill">Job Seeker Workspace</span>
          <h2>Track applications and manage your profile</h2>
        </div>
      </div>

      <form className="stack-form card filter-card" onSubmit={handleResumeUpload}>
        <label>Upload Resume</label>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setResume(event.target.files[0])} />
        <button className="btn">Upload Resume</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading dashboard...</p>}
      {user?.resumeUrl && <p className="muted">Current resume path: {user.resumeUrl}</p>}

      <section>
        <h3>Saved Jobs</h3>
        <div className="card-grid">
          {!loading &&
            savedJobs.map((job) => (
              <article className="card job-card" key={job._id}>
                <h4>{job.title}</h4>
                <p className="job-meta">{job.company}</p>
                <Link className="btn btn-secondary" to={`/jobs/${job._id}`}>
                  View
                </Link>
              </article>
            ))}
          {!loading && !savedJobs.length && !error && <p>You have no saved jobs yet.</p>}
        </div>
      </section>

      <section>
        <h3>Application Status Tracking</h3>
        <div className="card-grid">
          {!loading &&
            applications.map((application) => (
              <article className="card" key={application._id}>
                <h4>{application.job?.title}</h4>
                <p className="job-meta">{application.job?.company}</p>
                <p>Status: <span className="status-pill">{application.status}</span></p>
                <p className="muted">Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
              </article>
            ))}
          {!loading && !applications.length && !error && <p>No applications submitted yet.</p>}
        </div>
      </section>
    </section>
  );
};

export default JobSeekerDashboardPage;
