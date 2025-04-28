import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByMobile,
  verifyUserOtp,
} from "../../models/userModels.js";
import connection from "../../config/db.js";
import generateOTP from "../../middlewares/OTPGenrator.js";
import mailApi from "../../middlewares/MailAPI.js";

export const AdminRegister = async (req, res) => {
  const { firstName, lastName, mobileNumber, email, password } = req.body;

  if (!firstName || !lastName || !mobileNumber || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  let role = "admin";
  let bio = "hey admin these side";
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = {
      firstName,
      lastName,
      mobileNumber,
      email,
      password: hashedPassword,
      otp,
      role,
      bio,
    };

    createUser(user, (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ message: "Database error." });
      }

      mailApi({
        useremail: email,
        fromName: "Admin Cafe_Cruises",
        app_name: "cafe_cruises",
        message: "please verify your otp with APP",
        subject: "otp conformation",
        app_logo: "",
        generateotp: otp,
      })
        .then("otp send to Email working nicely")
        .catch("error while sending otp on mail");

      return res.status(201).json({
        message: "Admin registered. Please Verify OTP Check Your email.",
        otp,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const AdminLogin = (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      return res
        .status(400)
        .json({ message: "Mobile number and password are required." });
    }

    findUserByMobile(mobileNumber, async (err, user) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error during login." });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.isVerified !== 1) {
        return res
          .status(403)
          .json({ message: "Please verify your account first." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      if (user.role !== "admin")
        return res.json({
          success: false,
          message: "You are not Admin , dont have access ",
        });

      const { password: _, otp, ...userInfo } = user;

      return res.status(200).json({
        message: "WelCome Admin",
        user: userInfo,
      });
    });
  } catch (error) {
    res.json({
      success: false,
      message: "error in Admin Login" + error.message,
    });
  }
};

export const verifyOtpController = (req, res) => {
  const { mobileNumber, otp } = req.body;

  findUserByMobile(mobileNumber, (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: "Admin not found." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    verifyUserOtp(mobileNumber, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Verification failed." });
      }

      return res
        .status(200)
        .json({ message: "Account verified successfully." });
    });
  });
};

export const createTrip = (req, res) => {
  const { feeds, upcomingTrip } = req.body;
  const uploadedFiles = req.files || [];

  try {
    const parsedFeeds = feeds ? JSON.parse(feeds) : [];
    const parsedTrips = upcomingTrip ? JSON.parse(upcomingTrip) : [];

    const feedInserts = [];
    const tripInserts = [];

    parsedFeeds.forEach((feed, index) => {
      const imagePath =
        uploadedFiles[index] && uploadedFiles[index].filename
          ? `/uploads/${uploadedFiles[index].filename}`
          : null;

      const { title, description, announcements } = feed;

      feedInserts.push(
        new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO feeds (feedImage, title, description, announcements) VALUES (?, ?, ?, ?)",
            [imagePath, title, description, announcements],
            (err) => (err ? reject(err) : resolve())
          );
        })
      );
    });

    parsedTrips.forEach((ride) => {
      const { title, from, to, date, time, members } = ride;
      tripInserts.push(
        new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO upcoming_rides (title, startLocation, endLocation, rideDate, rideTime, members) VALUES (?, ?, ?, ?, ?, ?)",
            [title, from, to, date, time, members],
            (err) => (err ? reject(err) : resolve())
          );
        })
      );
    });

    Promise.all([...feedInserts, ...tripInserts])
      .then(() => {
        res.status(201).json({ message: "Trip Created successfully." });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ error: err.message || "Error while Creating trip." });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating trip.",
    });
  }
};

export const addCity = (req, res) => {
  const { cityName } = req.body;
  const cityImage = req.file ? `/uploads/${req.file.filename}` : null;

  if (!cityName || !cityImage) {
    return res
      .status(400)
      .json({ message: "cityName and cityImage are required." });
  }

  connection.query(
    "SELECT * FROM city WHERE cityName = ?",
    [cityName],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message,
        });
      }

      if (results.length > 0) {
        return res.json({
          success: false,
          message: "City Name Already Exists",
        });
      }

      const sql = "INSERT INTO city (cityName, cityImage) VALUES (?, ?)";
      connection.query(sql, [cityName, cityImage], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({
          message: "City added successfully",
          cityId: result.insertId,
        });
      });
    }
  );
};

export const getAllBikes = (req, res) => {
  connection.query("SELECT * FROM bikes", (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "error in dataBase" + err.message,
      });
    }
    res.status(200).json({
      success: true,
      bikes: result,
    });
  });
};

export const createInsurance = (req, res) => {
  const { insuranceAmount, accidentPayoutAmount } = req.body;

  if (!insuranceAmount || !accidentPayoutAmount) {
    return res.status(400).json({
      message: "Both insuranceAmount and accidentPayoutAmount are required.",
    });
  }

  const sql = `INSERT INTO Insurance (insuranceAmount, accidentPayoutAmount) VALUES (?, ?)`;
  connection.query(
    sql,
    [insuranceAmount, accidentPayoutAmount],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Insurance record created successfully",
        id: result.insertId,
      });
    }
  );
};
