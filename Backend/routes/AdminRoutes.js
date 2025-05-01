import express from "express";
import upload from "../middlewares/uploads.js";

// importing Post APIs
import {
  addCity,
  AdminLogin,
  AdminRegister,
  createInsurance,
  createTrip,
  verifyOtpController,
} from "../controllers/AdminAPI.js/PostAPIs.js";

// Importing PutAndDeleteAPIs
import {
  AdminVerifyClaim,
  AdminVerifyRider,
  AdminVerifyUser,
  deleteCity,
  deleteInsurance,
  updateCity,
  updateInsurance,
  verifyPendingBikes,
} from "../controllers/AdminAPI.js/PutAndDeleteAPIs.js";

// Importing GET APIs
import {
  getActiveRides,
  getAllCities,
  getAllDataForAdminPage,
  getAllInsurance,
  getAllPendingRequests,
  getAllPendingRides,
  getAllRiders,
  getAllUsers,
  getCityById,
  getCompletedRides,
  getDeletedRiders,
  getDeletedUsers,
  getInsuranceById,
  getPendingApprovedBikes,
  getPendingRiders,
  getPendingUsers,
  getRidersPerformance,
  getTotalBooking,
  getTotalEarning,
  totalBikes,
  totalReimburishedAmount,
} from "../controllers/AdminAPI.js/GetAPIs.js";

const AdminRouter = express.Router();

// Post APIs
AdminRouter.post("/register", AdminRegister);
AdminRouter.post("/Login", AdminLogin);
AdminRouter.post("/verify", verifyOtpController);
AdminRouter.post("/CreateTrip", upload.array("feedImages"), createTrip);
AdminRouter.post("/city", upload.single("cityImage"), addCity);
AdminRouter.post("/insurance", createInsurance);

// get APIs
AdminRouter.get("/city", getAllCities);
AdminRouter.get("/city/:id", getCityById);
AdminRouter.get("/getAllRider", getAllRiders);
AdminRouter.get("/getUsers", getAllUsers);
AdminRouter.get("/insurance", getAllInsurance);
AdminRouter.get("/insurance/:id", getInsuranceById);
AdminRouter.get("/getAllData", getAllDataForAdminPage);
AdminRouter.get("/totalBookings", getTotalBooking);

AdminRouter.get("/totalBikes", totalBikes);
AdminRouter.get("/getActiveRides", getActiveRides);
AdminRouter.get("/getAllPendingRequests", getAllPendingRequests);
AdminRouter.get("/getDeletedRider", getDeletedRiders);
AdminRouter.get("/getDeletedUsers", getDeletedUsers);
AdminRouter.get("/getPendingApprovedBikes", getPendingApprovedBikes);
AdminRouter.get("/pendingUserRouter", getPendingUsers);
AdminRouter.get("/pendingRiders", getPendingRiders);
AdminRouter.get("/getCompletedRides", getCompletedRides);
AdminRouter.get("/getAllPendingRides", getAllPendingRides);
AdminRouter.get("/totalEarning", getTotalEarning);
AdminRouter.get("/getRidersPerformance/:id", getRidersPerformance);
AdminRouter.get("/reimburishedAmount", totalReimburishedAmount);

// Delete APIs
AdminRouter.delete("/city/:id", deleteCity);
AdminRouter.delete("/insurance/:id", deleteInsurance);

// PUT APIs
AdminRouter.put("/insurance/:id", updateInsurance);
AdminRouter.put("/city/:id", upload.single("cityImage"), updateCity);
AdminRouter.put("/verifyRentalBike/:id", verifyPendingBikes);
AdminRouter.put("/verifyUser/:id", AdminVerifyUser);
AdminRouter.put("/verifyAdmin/:id", AdminVerifyRider);
AdminRouter.put("/verifyClaim/:id", AdminVerifyClaim);
// AdminRouter.put("/updateTripDetails");
// AdminRouter.get("/AllBikes");
// AdminRouter.get("/Details");

export default AdminRouter;
