import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const JobListingsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    skill: "",
    minBudget: "",
  });

  const fetchJobs = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/jobs", { params: filters });
      setJobs(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load jobs right now.");
    } finally {
      setLoading(false);
    }
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
    <section className="stack page-enter">
      <div className="section-head">
        <div>
          <span className="pill">Browse Opportunities</span>
          <h2>Find jobs that match your skills</h2>
        </div>
        <p className="muted">Use filters to quickly narrow high-quality freelance roles.</p>
      </div>

      <form className="grid-form card filter-card" onSubmit={handleSearch}>
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
      {error && <p className="error">{error}</p>}
      {loading && (
        <div className="card-grid">
          {[1, 2, 3].map((item) => (
            <article className="card skeleton-card" key={item}>
              <div className="skeleton-line w-70"></div>
              <div className="skeleton-line w-45"></div>
              <div className="skeleton-line w-90"></div>
              <div className="skeleton-line w-35"></div>
            </article>
          ))}
        </div>
      )}

      <div className="card-grid">
        {!loading &&
          jobs.map((job) => (
            <article className="card job-card interactive-card" key={job._id}>
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="job-budget">${job.budget}</span>
              </div>
              <p className="job-meta">{job.company}</p>
              <p className="job-meta">{job.location}</p>
              <div className="tags-wrap">
                {(job.skills?.length ? job.skills : ["No skills listed"]).map((skill) => (
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
        {!loading && !jobs.length && !error && <p>No jobs found.</p>}
      </div>
    </section>
  );
};

export default JobListingsPage;
