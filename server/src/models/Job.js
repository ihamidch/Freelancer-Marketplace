import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 0 },
    skills: [{ type: String }],
    employmentType: { type: String, default: "contract" },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
