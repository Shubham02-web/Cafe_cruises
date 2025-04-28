import express, { Router } from "express";
import upload from "../middlewares/uploads.js";
import {
  addChallan,
  confirmOTP,
  forgotPasswordSendOtpRider,
  // getBikes,
  loginRider,
  otpCheckedByMailVerifield,
  registerRider,
  resendOtpRider,
  resetPasswordRider,
  // rentBike,
} from "../controllers/RiderAPIs.js/POSTAPIs.js";
import {
  getTripDetails,
  getUpcomingTripById,
} from "../controllers/RiderAPIs.js/GETAPIs.js";

const RiderRoutes = express.Router();

// POST APIs

RiderRoutes.post("/forgetPass", forgotPasswordSendOtpRider);
RiderRoutes.post("/reset-pass", resetPasswordRider);
RiderRoutes.post("/resendOtp", resendOtpRider);

RiderRoutes.post("/register", upload.single("license"), registerRider);
RiderRoutes.post("/confirm-otp", confirmOTP);
RiderRoutes.post("/login", loginRider);
RiderRoutes.post("/loginOTP", otpCheckedByMailVerifield);
// RiderRoutes.post("/add-bike/:ownerId", upload.single("bikeImage"), rentBike);
RiderRoutes.post(
  "/add-chalan/:riderId",
  upload.single("chalanImage"),
  addChallan
);

// Get APIs
// RiderRoutes.get("/bikes", getBikes);
RiderRoutes.get("/getTrips/:cityId", getTripDetails);
RiderRoutes.get("/getTripById/:id", getUpcomingTripById);

export default RiderRoutes;
