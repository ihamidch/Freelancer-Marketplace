import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <section className="stack">
      <article className="hero-card">
        <span className="pill">MERN Freelance Marketplace</span>
        <h1>Find top freelance projects and hire verified talent faster</h1>
        <p>
          FreelanceHub helps employers publish jobs and manage applicants, while job seekers discover
          opportunities, apply with confidence, and track every application.
        </p>
        <div className="actions">
          <Link className="btn" to="/jobs">
            Explore Jobs
          </Link>
          <Link className="btn btn-secondary" to="/auth">
            Create Account
          </Link>
        </div>
      </article>

      <section className="stats-grid">
        <article className="card">
          <h3>Role-based dashboards</h3>
          <p className="muted">Custom experience for employers and job seekers.</p>
        </article>
        <article className="card">
          <h3>Smart job discovery</h3>
          <p className="muted">Search and filter by keyword, location, skill, and budget.</p>
        </article>
        <article className="card">
          <h3>Application tracking</h3>
          <p className="muted">Track statuses from applied to shortlisted in real time.</p>
        </article>
      </section>
    </section>
  );
};

export default HomePage;
