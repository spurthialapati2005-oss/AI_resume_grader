import jwt from "jsonwebtoken";

import UserModel from "../models/UserModel.js";


export const authMiddleware = async ( req, res, next ) => {
    try {
        // Get token from cookies
        const token = req?.cookies?.token;

        // Check token exists
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided", });
        }
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user from database
        const user = await UserModel.findById( decoded.userId ).select("-password");

        // Invalid user
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid user",});
        }

        // Attach user to request
        req.user = user;

        next();

   } catch (err) {

    console.error("Authentication Error:",err);

    return res.status(401).json({
      success: false,
      message: "Authentication Failed",
      error: err.message,
    });

  }

};