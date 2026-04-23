import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const JobDetailsPage = () => {
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      setError("");
      setLoading(true);
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!user) {
      navigate(`/auth?next=${encodeURIComponent(`/jobs/${id}`)}`);
      return;
    }
    try {
      await api.post(`/applications/${id}`, { coverLetter });
      setMessage("Application submitted successfully.");
      addToast("Application submitted successfully", "success");
      setCoverLetter("");
    } catch (err) {
      const nextError = err.response?.data?.message || "Could not submit application.";
      setError(nextError);
      addToast(nextError, "error");
    }
  };

  const handleSave = async () => {
    setMessage("");
    setError("");
    if (!user) {
      navigate(`/auth?next=${encodeURIComponent(`/jobs/${id}`)}`);
      return;
    }
    try {
      const { data } = await api.put(`/jobs/${id}/save`);
      updateUser({ savedJobs: data.savedJobs });
      setMessage("Saved jobs updated.");
      addToast("Saved jobs updated", "success");
    } catch (err) {
      const nextError = err.response?.data?.message || "Could not update saved jobs.";
      setError(nextError);
      addToast(nextError, "error");
    }
  };

  if (loading) {
    return (
      <section className="stack page-enter">
        <article className="card skeleton-card">
          <div className="skeleton-line w-70"></div>
          <div className="skeleton-line w-45"></div>
          <div className="skeleton-line w-90"></div>
          <div className="skeleton-line w-70"></div>
        </article>
      </section>
    );
  }
  if (error && !job) return <p className="error">{error}</p>;
  if (!job) return <p>Job not found.</p>;

  const isJobSeeker = user?.role === "job_seeker";

  return (
    <section className="stack page-enter">
      <article className="card interactive-card">
        <div className="job-header">
          <h2>{job.title}</h2>
          <span className="job-budget">${job.budget}</span>
        </div>
        <p className="job-meta">
          <strong>{job.company}</strong> • {job.location}
        </p>
        <p>{job.description}</p>
        <div className="details-grid">
          <p className="muted">Employment Type: {job.employmentType}</p>
          <div className="tags-wrap">
            {(job.skills?.length ? job.skills : ["None listed"]).map((skill) => (
              <span className="tag" key={`${job._id}-${skill}`}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </article>

      <article className="card">
        <h3>Apply for this role</h3>
        {!user && (
          <>
            <p className="muted">
              Login as a freelancer to submit your application and save this job.
            </p>
            <Link className="btn" to={`/auth?next=${encodeURIComponent(`/jobs/${id}`)}`}>
              Login to Apply
            </Link>
          </>
        )}

        {user && !isJobSeeker && (
          <p className="muted">
            You are logged in as an employer. Switch to a job seeker account to apply.
          </p>
        )}

        {isJobSeeker && (
          <>
            <button className="btn btn-secondary" onClick={handleSave}>
              Save Job
            </button>
            <form className="stack-form" onSubmit={handleApply}>
              <textarea
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                placeholder="Write a concise cover letter highlighting relevant experience."
                rows={5}
              />
              <button className="btn">Apply Now</button>
            </form>
          </>
        )}
      </article>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
};

export default JobDetailsPage;
