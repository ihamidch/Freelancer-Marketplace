import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <section className="hero-card">
      <h1>Find freelance projects and top talent in one place</h1>
      <p>
        FreelanceHub is a MERN-powered job portal where employers post opportunities and job seekers
        discover, save, and apply in minutes.
      </p>
      <div className="actions">
        <Link className="btn" to="/jobs">
          Explore Jobs
        </Link>
        <Link className="btn btn-secondary" to="/auth">
          Create Account
        </Link>
      </div>
    </section>
  );
};

export default HomePage;
