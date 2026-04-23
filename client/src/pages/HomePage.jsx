import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <section className="stack page-enter">
      <article className="hero-card hero-split">
        <div>
          <span className="pill">MERN Freelance Marketplace</span>
          <h1>Hire Freelancers or Get Hired Instantly</h1>
          <p>A modern freelance marketplace built with MERN stack</p>
          <div className="actions">
            <Link className="btn" to="/jobs">
              Find Talent
            </Link>
            <Link className="btn btn-secondary" to="/auth">
              Become Freelancer
            </Link>
          </div>
        </div>
        <div className="hero-trust">
          <h3>Why startups choose FreelanceHub</h3>
          <ul className="trust-list">
            <li>Pre-structured client and freelancer workflows</li>
            <li>Fast role-based onboarding in under 60 seconds</li>
            <li>Professional dashboards for hiring visibility</li>
          </ul>
        </div>
      </article>

      <section className="stats-grid">
        <article className="card feature-card">
          <h3>Post Jobs Easily</h3>
          <p className="muted">Create detailed projects with skills, budget, location, and contract type.</p>
        </article>
        <article className="card feature-card">
          <h3>Apply to Jobs</h3>
          <p className="muted">Freelancers can submit tailored applications with resume and cover letter.</p>
        </article>
        <article className="card feature-card">
          <h3>Secure Communication</h3>
          <p className="muted">Authenticated role-based access keeps hiring actions protected by design.</p>
        </article>
        <article className="card feature-card">
          <h3>Fast Hiring System</h3>
          <p className="muted">Review, shortlist, and update applicant status from a single workspace.</p>
        </article>
      </section>

      <section className="card flow-section">
        <div className="section-head">
          <div>
            <span className="pill">Dual User Journey</span>
            <h2>Clear flow for clients and freelancers</h2>
          </div>
        </div>
        <div className="flow-grid">
          <article className="card flow-card">
            <h3>Client Flow</h3>
            <ol className="flow-list">
              <li>Post job</li>
              <li>View freelancers</li>
              <li>Hire freelancer</li>
            </ol>
          </article>
          <article className="card flow-card">
            <h3>Freelancer Flow</h3>
            <ol className="flow-list">
              <li>Browse jobs</li>
              <li>Apply for job</li>
              <li>Get hired</li>
            </ol>
          </article>
        </div>
      </section>

      <article className="card trust-strip">
        <h3>Built for modern hiring teams and freelance talent</h3>
        <p>
          Designed as a portfolio-ready SaaS product with structured workflows, reliable application tracking,
          and a premium UI optimized for desktop and mobile.
        </p>
      </article>
    </section>
  );
};

export default HomePage;
