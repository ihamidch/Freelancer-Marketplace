import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import User from "./src/models/User.js";
import Job from "./src/models/Job.js";
import Application from "./src/models/Application.js";

dotenv.config();

const dayMs = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * dayMs);

const seedUsers = async () => {
  // Schema supports employer/job_seeker; this seeded admin profile is employer-scoped.
  const admin = await User.create({
    name: "Amina Rahman (Admin)",
    email: "admin@freelancehub.dev",
    password: "Admin@123",
    role: "employer",
    resumeUrl: "",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(7),
  });

  const clients = await User.create([
    {
      name: "Liam Carter",
      email: "liam.carter@northpeak.io",
      password: "Client@123",
      role: "employer",
      createdAt: daysAgo(40),
      updatedAt: daysAgo(6),
    },
    {
      name: "Priya Menon",
      email: "priya@scaleforge.ai",
      password: "Client@123",
      role: "employer",
      createdAt: daysAgo(36),
      updatedAt: daysAgo(4),
    },
    {
      name: "Ethan Brooks",
      email: "ethan@brightlabs.co",
      password: "Client@123",
      role: "employer",
      createdAt: daysAgo(34),
      updatedAt: daysAgo(5),
    },
    {
      name: "Maya Santoso",
      email: "maya@moonridge.studio",
      password: "Client@123",
      role: "employer",
      createdAt: daysAgo(31),
      updatedAt: daysAgo(3),
    },
    {
      name: "Carlos Mendes",
      email: "carlos@pixelharbor.com",
      password: "Client@123",
      role: "employer",
      createdAt: daysAgo(29),
      updatedAt: daysAgo(2),
    },
  ]);

  const freelancers = await User.create([
    {
      name: "Noah Kim",
      email: "noah.kim@freelancer.dev",
      password: "Freelancer@123",
      role: "job_seeker",
      resumeUrl: "/uploads/noah-kim-resume.pdf",
      createdAt: daysAgo(38),
      updatedAt: daysAgo(2),
    },
    {
      name: "Sofia Alvarez",
      email: "sofia.alvarez@freelancer.dev",
      password: "Freelancer@123",
      role: "job_seeker",
      resumeUrl: "/uploads/sofia-alvarez-resume.pdf",
      createdAt: daysAgo(35),
      updatedAt: daysAgo(2),
    },
    {
      name: "Daniel Okafor",
      email: "daniel.okafor@freelancer.dev",
      password: "Freelancer@123",
      role: "job_seeker",
      resumeUrl: "/uploads/daniel-okafor-resume.pdf",
      createdAt: daysAgo(33),
      updatedAt: daysAgo(1),
    },
    {
      name: "Emma Rossi",
      email: "emma.rossi@freelancer.dev",
      password: "Freelancer@123",
      role: "job_seeker",
      resumeUrl: "/uploads/emma-rossi-resume.pdf",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      name: "Yusuf Ahmed",
      email: "yusuf.ahmed@freelancer.dev",
      password: "Freelancer@123",
      role: "job_seeker",
      resumeUrl: "/uploads/yusuf-ahmed-resume.pdf",
      createdAt: daysAgo(28),
      updatedAt: daysAgo(1),
    },
  ]);

  return { admin, clients, freelancers };
};

const seedJobs = async (employers) => {
  const jobs = await Job.insertMany([
    {
      title: "Build React E-commerce Website",
      company: "NorthPeak Labs",
      description:
        "Need a responsive React storefront with product filtering, cart flow, and clean checkout UX. API integration with Node backend is required.",
      location: "Remote (US/EU overlap)",
      budget: 1200,
      skills: ["React", "Node.js", "MongoDB", "REST API", "Stripe"],
      employmentType: "contract",
      postedBy: employers[1]._id,
      createdAt: daysAgo(14),
      updatedAt: daysAgo(3),
    },
    {
      title: "Design and Develop SaaS Marketing Landing Page",
      company: "ScaleForge AI",
      description:
        "Looking for a frontend specialist to craft a conversion-focused SaaS landing page with modern animations and mobile-first polish.",
      location: "Remote",
      budget: 650,
      skills: ["React", "Tailwind CSS", "Figma", "UI/UX"],
      employmentType: "contract",
      postedBy: employers[2]._id,
      createdAt: daysAgo(13),
      updatedAt: daysAgo(2),
    },
    {
      title: "Implement JWT Auth + RBAC in MERN App",
      company: "BrightLabs",
      description:
        "Existing app needs secure login/register, role-based routes, and token refresh hardening. Prior production auth experience preferred.",
      location: "Remote",
      budget: 900,
      skills: ["Node.js", "Express", "JWT", "MongoDB", "Security"],
      employmentType: "contract",
      postedBy: employers[3]._id,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(4),
    },
    {
      title: "Optimize MongoDB Queries for Analytics Dashboard",
      company: "Moonridge Studio",
      description:
        "We need help refactoring slow aggregation pipelines and indexing strategy for high-volume dashboard queries.",
      location: "Remote (APAC preferred)",
      budget: 750,
      skills: ["MongoDB", "Mongoose", "Performance", "Node.js"],
      employmentType: "part-time",
      postedBy: employers[4]._id,
      createdAt: daysAgo(11),
      updatedAt: daysAgo(2),
    },
    {
      title: "Build Real-time Chat Module for Client Portal",
      company: "PixelHarbor",
      description:
        "Add real-time chat to our platform with typing indicators and message persistence. Socket integration with Express backend.",
      location: "Remote",
      budget: 1500,
      skills: ["Socket.io", "React", "Node.js", "MongoDB"],
      employmentType: "contract",
      postedBy: employers[5]._id,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(1),
    },
    {
      title: "Convert Legacy Admin Panel to React",
      company: "NorthPeak Labs",
      description:
        "Migrate key admin workflows from jQuery templates to modular React components with reusable table and form patterns.",
      location: "Remote",
      budget: 1000,
      skills: ["React", "JavaScript", "Refactor", "CSS"],
      employmentType: "full-time",
      postedBy: employers[1]._id,
      createdAt: daysAgo(9),
      updatedAt: daysAgo(1),
    },
    {
      title: "Fix Production Bugs in Freelancer Marketplace",
      company: "ScaleForge AI",
      description:
        "Need quick turnaround on bug triage: auth edge cases, dashboard render issues, and API error handling polish.",
      location: "Remote",
      budget: 400,
      skills: ["React", "Express", "Debugging", "REST API"],
      employmentType: "contract",
      postedBy: employers[2]._id,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(1),
    },
    {
      title: "Build Stripe Payment Intent Endpoint",
      company: "BrightLabs",
      description:
        "Implement secure Stripe payment-intent flow and server-side validation. Include test mode setup and webhook handling notes.",
      location: "Remote",
      budget: 550,
      skills: ["Node.js", "Stripe", "Express", "Webhooks"],
      employmentType: "contract",
      postedBy: employers[3]._id,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(1),
    },
    {
      title: "Create Design System for Hiring Dashboard",
      company: "Moonridge Studio",
      description:
        "Establish consistent spacing, typography, and component library for employer dashboard and candidate tracking screens.",
      location: "Hybrid (Singapore)",
      budget: 1300,
      skills: ["Design System", "UI/UX", "React", "Storybook"],
      employmentType: "part-time",
      postedBy: employers[4]._id,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(1),
    },
    {
      title: "Deploy MERN App to Vercel with CI Pipeline",
      company: "FreelanceHub Admin Team",
      description:
        "Set up production deployment for frontend/backend, configure environment variables, and add basic CI checks for pull requests.",
      location: "Remote",
      budget: 800,
      skills: ["Vercel", "GitHub Actions", "Node.js", "React"],
      employmentType: "contract",
      postedBy: employers[0]._id,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
  ]);

  return jobs;
};

const seedApplications = async (jobs, freelancers) => {
  const applicationRows = [
    [0, 0, "reviewing", 1100],
    [1, 1, "shortlisted", 620],
    [2, 2, "accepted", 900],
    [3, 3, "applied", 700],
    [4, 4, "reviewing", 1400],
    [5, 1, "rejected", 950],
    [6, 0, "shortlisted", 380],
    [7, 2, "reviewing", 540],
    [8, 3, "accepted", 1250],
    [9, 4, "applied", 780],
    [3, 1, "reviewing", 720],
    [0, 2, "rejected", 1000],
  ];

  const applications = await Application.insertMany(
    applicationRows.map(([jobIndex, freelancerIndex, status, proposedBudget], index) => ({
      job: jobs[jobIndex]._id,
      applicant: freelancers[freelancerIndex]._id,
      status,
      coverLetter: `Hi team, I have delivered similar MERN projects with production deployments and strong communication. Proposed budget: $${proposedBudget}. I can start immediately and provide daily updates.`,
      createdAt: daysAgo(4 - (index % 4)),
      updatedAt: daysAgo(index % 2),
    }))
  );

  return applications;
};

const seedSavedJobs = async (jobs, freelancers) => {
  const updates = freelancers.map((freelancer, index) => {
    const savedJobs = [jobs[index]._id, jobs[(index + 2) % jobs.length]._id, jobs[(index + 5) % jobs.length]._id];
    return User.findByIdAndUpdate(freelancer._id, { savedJobs }, { new: true });
  });
  await Promise.all(updates);
};

const runSeed = async () => {
  try {
    await connectDB();

    await Promise.all([Application.deleteMany({}), Job.deleteMany({}), User.deleteMany({})]);

    const { admin, clients, freelancers } = await seedUsers();
    const employers = [admin, ...clients];
    const jobs = await seedJobs(employers);
    const applications = await seedApplications(jobs, freelancers);
    await seedSavedJobs(jobs, freelancers);

    console.log("Seed completed successfully:");
    console.log(`- Users: ${1 + clients.length + freelancers.length} (1 admin profile, 5 clients, 5 freelancers)`);
    console.log(`- Jobs: ${jobs.length}`);
    console.log(`- Applications: ${applications.length}`);
    console.log("Default passwords:");
    console.log("- Admin profile: Admin@123");
    console.log("- Client users: Client@123");
    console.log("- Freelancer users: Freelancer@123");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runSeed();
