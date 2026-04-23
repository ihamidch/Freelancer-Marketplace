import { generateAccessToken } from "./tokenService.js";

const generateToken = (userId) => generateAccessToken(userId);

export default generateToken;
