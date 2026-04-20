import { useEffect, useState } from "react";
import api from "../api/client";

const statusOptions = ["reviewing", "shortlisted", "rejected", "accepted"];

const EmployerDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
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

  const fetchDashboardData = async () => {
    const [jobsResponse, applicantsResponse] = await Promise.all([
      api.get("/jobs/dashboard/employer"),
      api.get("/applications/employer/applicants"),
    ]);
    setJobs(jobsResponse.data);
    setApplicants(applicantsResponse.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  const handlePostJob = async (event) => {
    event.preventDefault();
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
  };

  const updateStatus = async (applicationId, status) => {
    await api.put(`/applications/${applicationId}/status`, { status });
    fetchDashboardData();
  };

  return (
    <section className="stack">
      <h2>Employer Dashboard</h2>
      <form className="grid-form" onSubmit={handlePostJob}>
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

      <section>
        <h3>Your Posted Jobs</h3>
        <div className="card-grid">
          {jobs.map((job) => (
            <article className="card" key={job._id}>
              <h4>{job.title}</h4>
              <p>{job.location}</p>
              <p>${job.budget}</p>
            </article>
          ))}
          {!jobs.length && <p>No jobs posted yet.</p>}
        </div>
      </section>

      <section>
        <h3>Applicants</h3>
        <div className="card-grid">
          {applicants.map((application) => (
            <article className="card" key={application._id}>
              <p>
                <strong>{application.applicant?.name}</strong> applied for{" "}
                <strong>{application.job?.title}</strong>
              </p>
              <p>Email: {application.applicant?.email}</p>
              <p>Resume: {application.applicant?.resumeUrl || "Not uploaded"}</p>
              <p>Status: {application.status}</p>
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
          {!applicants.length && <p>No applications yet.</p>}
        </div>
      </section>
    </section>
  );
};

export default EmployerDashboardPage;
