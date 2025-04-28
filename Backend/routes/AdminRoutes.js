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
  deleteCity,
  deleteInsurance,
  updateCity,
  updateInsurance,
} from "../controllers/AdminAPI.js/PutAndDeleteAPIs.js";

// Importing GET APIs
import {
  getActiveRides,
  getAllCities,
  getAllDataForAdminPage,
  getAllInsurance,
  getAllRiders,
  getAllUsers,
  getCityById,
  getInsuranceById,
  getTotalBooking,
  totalBikes,
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

// Delete APIs
AdminRouter.delete("/city/:id", deleteCity);
AdminRouter.delete("/insurance/:id", deleteInsurance);

// PUT APIs
AdminRouter.put("/insurance/:id", updateInsurance);
AdminRouter.put("/city/:id", upload.single("cityImage"), updateCity);

// AdminRouter.put("/updateTripDetails");
// AdminRouter.get("/AllBikes");
// AdminRouter.get("/Details");

export default AdminRouter;
