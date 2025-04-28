import express from "express";
import dotenv from "dotenv";
import AdminRouter from "./routes/AdminRoutes.js";
import RiderRoutes from "./routes/RiderRoutes.js";
import UserRouter from "./routes/User.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use("/api", UserRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/rider", RiderRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
