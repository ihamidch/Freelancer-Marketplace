import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

export const applyToJob = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const job = await Job.findById(req.params.jobId).populate("postedBy", "email name");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existingApplication = await Application.findOne({
      job: job._id,
      applicant: req.user._id,
    });
    if (existingApplication) {
      return res.status(400).json({ message: "You already applied to this job" });
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      coverLetter,
    });

    await sendEmail({
      to: job.postedBy.email,
      subject: `New application for ${job.title}`,
      text: `${req.user.name} has applied to your job posting.`,
    });

    return res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({ message: "Could not submit application", error: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job", "title company location")
      .sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch applications", error: error.message });
  }
};

export const getApplicantsForEmployer = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title")
      .populate("applicant", "name email resumeUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch applicants", error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.applicationId)
      .populate("job")
      .populate("applicant", "email name");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const ownsJob = application.job.postedBy.toString() === req.user._id.toString();
    if (!ownsJob) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    application.status = status;
    await application.save();

    await sendEmail({
      to: application.applicant.email,
      subject: `Application status updated: ${application.job.title}`,
      text: `Hi ${application.applicant.name}, your application status is now "${status}".`,
    });

    return res.status(200).json(application);
  } catch (error) {
    return res.status(500).json({ message: "Could not update status", error: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const user = await User.findById(req.user._id);
    user.resumeUrl = `/uploads/${req.file.filename}`;
    await user.save();

    return res.status(200).json({ resumeUrl: user.resumeUrl });
  } catch (error) {
    return res.status(500).json({ message: "Could not upload resume", error: error.message });
  }
};
