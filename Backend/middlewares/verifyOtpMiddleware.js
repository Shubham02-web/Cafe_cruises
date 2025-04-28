import { findUserByMobile } from "../models/userModels.js";

export const verifyOtpMiddleware = (req, res, next) => {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
        return res
            .status(400)
            .json({ message: "Mobile number and OTP are required." });
    }

    findUserByMobile(mobileNumber, (err, user) => {
        if (err)
            return res
                .status(500)
                .json({ message: "Server error during OTP verification." });

        if (!user) return res.status(404).json({ message: "User not found." });

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }
        next();
    });
};