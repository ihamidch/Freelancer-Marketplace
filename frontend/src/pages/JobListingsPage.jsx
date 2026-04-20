import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const JobListingsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    skill: "",
    minBudget: "",
  });

  const fetchJobs = async () => {
    const { data } = await api.get("/jobs", { params: filters });
    setJobs(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    await fetchJobs();
  };

  return (
    <section>
      <h2>Job Listings</h2>
      <form className="grid-form" onSubmit={handleSearch}>
        <input
          placeholder="Search title/company"
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
        />
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
        />
        <input
          placeholder="Skill"
          value={filters.skill}
          onChange={(event) => setFilters((prev) => ({ ...prev, skill: event.target.value }))}
        />
        <input
          placeholder="Minimum budget"
          type="number"
          value={filters.minBudget}
          onChange={(event) => setFilters((prev) => ({ ...prev, minBudget: event.target.value }))}
        />
        <button className="btn">Search</button>
      </form>

      <div className="card-grid">
        {jobs.map((job) => (
          <article className="card" key={job._id}>
            <h3>{job.title}</h3>
            <p>{job.company}</p>
            <p>{job.location}</p>
            <p>Budget: ${job.budget}</p>
            <p className="muted">{job.skills?.join(", ") || "No skills listed"}</p>
            <Link className="btn btn-secondary" to={`/jobs/${job._id}`}>
              View Details
            </Link>
          </article>
        ))}
        {!jobs.length && <p>No jobs found.</p>}
      </div>
    </section>
  );
};

export default JobListingsPage;
