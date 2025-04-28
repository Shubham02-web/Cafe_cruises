import express from "express";

// Importing PUT APIs

import {
  register,
  verifyOtpController,
  login,
  forgotPasswordSendOtp,
  resetPassword,
  resendOtp,
  rentBike,
  bookRide,
  confirmRidePayment,
  BookBikeAPI,
  verifyRideOtp,
  conformPaymentBook,
  OTPForBikeBook,
  initiateTripJoin,
  confirmTripPayment,
  submitReview,
  verifyTripOTP,
  loginOTPVerification,
} from "../controllers/UserAPIs/PostAPIs.js";

// Importing GET APIs

import {
  fetchBikesByUserID,
  getAllCities,
  getAllInsurance,
  getBikeDetailsById,
  getBikes,
  getCityByName,
  getFeed,
  getInsuranceById,
  getTripDetails,
  getUpcomingTripById,
  getUserById,
} from "../controllers/UserAPIs/getAPIs.js";
import { verifyOtpMiddleware } from "../middlewares/verifyOtpMiddleware.js";
import upload from "../middlewares/uploads.js";
import { bikeUpdate, updateUser } from "../controllers/UserAPIs/PutAPI.js";
import { deleteBike } from "../controllers/UserAPIs/DeleteAPIs.js";

const bookBike = upload.fields([
  { name: "licenseImage", maxCount: 1 },
  { name: "idCardImage", maxCount: 1 },
]);

const UserRouter = express.Router();
// POST APIs
UserRouter.post("/register", register);
UserRouter.post("/verify-otp", verifyOtpController);
UserRouter.post("/login", login);
UserRouter.post("/forgot-password/send-otp", forgotPasswordSendOtp);
UserRouter.post("/forgot-password/reset", verifyOtpMiddleware, resetPassword);
UserRouter.post("/resend-otp", resendOtp);
UserRouter.post("/add-bike/:ownerId", upload.single("bikeImage"), rentBike);
// UserRouter.post("/book-ride/:id", bookRide);
UserRouter.post("/confirm-payment", confirmRidePayment);
UserRouter.post("/book-bike", bookBike, BookBikeAPI);
UserRouter.post("/verify-ride-otp", verifyRideOtp);
UserRouter.post("/confirm-bike-payment", conformPaymentBook);
UserRouter.post("/verify-bike-otp", OTPForBikeBook);
UserRouter.post("/ask-to-join", initiateTripJoin);
UserRouter.post("/confirm-payment", confirmTripPayment);
UserRouter.post("/reviews", submitReview);
UserRouter.post("/trip/verify-otp", verifyTripOTP);
UserRouter.post("/login/verify-otp", loginOTPVerification);

// GET APIs
UserRouter.get("/getAllCities", getAllCities);
UserRouter.get("/cityByName/:cityName", getCityByName);
UserRouter.get("/bikes/:id", getBikes);
UserRouter.get("/bike/:id", getBikeDetailsById);
UserRouter.get("/getUser/:id", getUserById);
UserRouter.get("/insurance/:id", getInsuranceById);
UserRouter.get("/insurance", getAllInsurance);
UserRouter.get("/getFeed", getFeed);
UserRouter.get("/trips/:cityId", getTripDetails);
UserRouter.get("/trips/:id", getUpcomingTripById);
UserRouter.get("/fetch-bike/:id", fetchBikesByUserID);

// PUT API
UserRouter.put("/update/:id", updateUser);
UserRouter.put("/update-bike/:id", upload.array("bikeImage"), bikeUpdate);

// Delete API
UserRouter.delete("/delete/:id", deleteBike);

export default UserRouter;
