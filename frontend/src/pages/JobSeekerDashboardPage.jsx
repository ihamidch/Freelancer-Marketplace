import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const JobSeekerDashboardPage = () => {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const { user, updateUser } = useAuth();

  const fetchData = async () => {
    const applicationsResponse = await api.get("/applications/me");
    setApplications(applicationsResponse.data);

    const savedIds = user?.savedJobs || [];
    const jobs = await Promise.all(savedIds.map((jobId) => api.get(`/jobs/${jobId}`).then((res) => res.data)));
    setSavedJobs(jobs);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResumeUpload = async (event) => {
    event.preventDefault();
    if (!resume) return;
    const formData = new FormData();
    formData.append("resume", resume);

    const { data } = await api.post("/applications/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    updateUser({ resumeUrl: data.resumeUrl });
    setMessage("Resume uploaded successfully.");
  };

  return (
    <section className="stack">
      <h2>Job Seeker Dashboard</h2>

      <form className="stack-form" onSubmit={handleResumeUpload}>
        <label>Upload Resume</label>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setResume(event.target.files[0])} />
        <button className="btn">Upload Resume</button>
      </form>
      {message && <p className="success">{message}</p>}
      {user?.resumeUrl && <p className="muted">Current resume path: {user.resumeUrl}</p>}

      <section>
        <h3>Saved Jobs</h3>
        <div className="card-grid">
          {savedJobs.map((job) => (
            <article className="card" key={job._id}>
              <h4>{job.title}</h4>
              <p>{job.company}</p>
              <Link className="btn btn-secondary" to={`/jobs/${job._id}`}>
                View
              </Link>
            </article>
          ))}
          {!savedJobs.length && <p>You have no saved jobs yet.</p>}
        </div>
      </section>

      <section>
        <h3>Application Status Tracking</h3>
        <div className="card-grid">
          {applications.map((application) => (
            <article className="card" key={application._id}>
              <h4>{application.job?.title}</h4>
              <p>{application.job?.company}</p>
              <p>Status: {application.status}</p>
              <p>Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
            </article>
          ))}
          {!applications.length && <p>No applications submitted yet.</p>}
        </div>
      </section>
    </section>
  );
};

export default JobSeekerDashboardPage;
