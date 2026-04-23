export const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const normalizeRoleInput = (role = "") => {
  if (role === "client") return "employer";
  if (role === "freelancer") return "job_seeker";
  return role;
};
