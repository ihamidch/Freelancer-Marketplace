import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import EmployerDashboardPage from "./pages/EmployerDashboardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import JobDetailsPage from "./pages/JobDetailsPage.jsx";
import JobListingsPage from "./pages/JobListingsPage.jsx";
import JobSeekerDashboardPage from "./pages/JobSeekerDashboardPage.jsx";

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListingsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route
            path="/dashboard/employer"
            element={
              <ProtectedRoute role="employer">
                <EmployerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/job-seeker"
            element={
              <ProtectedRoute role="job_seeker">
                <JobSeekerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
