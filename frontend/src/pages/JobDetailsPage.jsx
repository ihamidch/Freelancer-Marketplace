import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const JobDetailsPage = () => {
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data);
    };
    fetchJob();
  }, [id]);

  const handleApply = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    await api.post(`/applications/${id}`, { coverLetter });
    setMessage("Application submitted successfully.");
    setCoverLetter("");
  };

  const handleSave = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const { data } = await api.put(`/jobs/${id}/save`);
    updateUser({ savedJobs: data.savedJobs });
    setMessage("Saved jobs updated.");
  };

  if (!job) return <p>Loading...</p>;

  const canApply = user?.role === "job_seeker";

  return (
    <section className="card">
      <h2>{job.title}</h2>
      <p>
        <strong>{job.company}</strong> - {job.location}
      </p>
      <p>{job.description}</p>
      <p>Employment type: {job.employmentType}</p>
      <p>Budget: ${job.budget}</p>
      <p>Skills: {job.skills?.join(", ") || "None listed"}</p>

      {canApply && (
        <>
          <button className="btn btn-secondary" onClick={handleSave}>
            Save Job
          </button>
          <form className="stack-form" onSubmit={handleApply}>
            <textarea
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Write your cover letter"
              rows={4}
            />
            <button className="btn">Apply Now</button>
          </form>
        </>
      )}
      {message && <p className="success">{message}</p>}
    </section>
  );
};

export default JobDetailsPage;
