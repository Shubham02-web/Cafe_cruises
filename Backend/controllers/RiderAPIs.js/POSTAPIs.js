import bcrypt, { hash } from "bcryptjs";
import connection from "../../config/db.js";
import mailApi from "../../middlewares/MailAPI.js";

export const registerRider = async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, password } = req.body;
    const license = req.files ? req.files.filename[0] : null;
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = "123456";

    const sql = `
      INSERT INTO riders (firstName, lastName, mobile, email, password, license, otp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

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

    connection.query(
      sql,
      [firstName, lastName, mobile, email, hashedPassword, license, otp],
      (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({
          message: "Rider account created. Now verify your email with otp.",
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const sql = "SELECT * FROM riders WHERE email = ? AND otp = ?";
    connection.query(sql, [email, otp], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(400).json({ message: "Invalid OTP or mobile" });

      connection.query(
        "UPDATE riders SET isVerified = 1 WHERE email = ?",
        [email],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json({ message: "Your account has been successfully verified!" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in Conform OTP API" + error.message,
    });
  }
};

export const loginRider = async (req, res) => {
  try {
    const { email } = req.body;
    let otp = "123456";

    connection.query(
      "update riders set otp = ?  WHERE email = ?",
      [otp],
      [email],
      async (err, results) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "error in loginRider" + err.message,
          });
        if (results.length === 0)
          return res
            .status(200)
            .json({ success: true, message: "Rider not found" });
      }
    );

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
    res.json({
      success: true,
      message: "otp sended to your Registerd Email please verify it to login ",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in login Rider API" + error.message,
    });
  }
};

export const otpCheckedByMailVerifield = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    let sql =
      "SELECT firstName , lastName FROM riders WHERE otp = ? AND mobile = ?";
    connection.query(sql, [otp, mobile], (err, result) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "error DB " + err.message,
        });

      if (result.length < 1)
        return res.status(404).json({
          success: false,
          message: "Data Not found",
        });

      res.status(200).json({
        success: true,
        message: "Rider login and otp  verification successfully",
        result,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in login OTP Check API for rider" + error.message,
    });
  }
};

export const addChallan = async (req, res) => {
  try {
    const { amount } = req.body;
    const riderId = req.params.riderId;
    const image = req.file ? req.file.filename : null;

    connection.query(
      "SELECT chalan FROM riders WHERE id = ?",
      [riderId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err });
        const currentChalans = results[0]
          ? results[0].chalan
            ? JSON.parse(results[0].chalan)
            : []
          : null;
        const newChalan = { image, amount };
        currentChalans.push(newChalan);

        connection.query(
          "UPDATE riders SET chalan = ? WHERE id = ?",
          [JSON.stringify(currentChalans), riderId],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.json({ message: "Chalan details saved successfully" });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in Add Chalan APIs" + error.message,
    });
  }
};

export const forgotPasswordSendOtpRider = (req, res) => {
  try {
    const { email } = req.body;
    let otp = "123456";
    if (!email) {
      return res.status(400).json({ message: "email is required." });
    }

    let sql = "SELECT * FROM riders where email = ? ";
    connection.query(sql, [email], (err, result) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "Error in DB" + err.message,
        });
      if (result.length < 1)
        return res.json({
          success: false,
          message: "No Data Found For these Email",
        });

      if (result.length > 0) {
        let sql = "update riders set otp = ? where email = ?";
        connection.query(sql, [otp, email], (err, user) => {
          if (err)
            return res.status(500).json({
              success: false,
              message: "error in DB" + err.message,
            });
          if (user.length < 1) return res.send("user not found");
        });
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

      res.status(200).json({
        success: true,
        message: "OTP Sended to Your Email",
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in forgotPasswordSendOTPRider",
    });
  }
};

export const resetPasswordRider = async (req, res) => {
  const { mobileNumber, newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: "New password is required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    let sql = "update riders set password = ? where mobile = ? ";
    connection.query(sql, [hashedPassword, mobileNumber], (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ message: "Failed to reset password." });
      }
      if (result.length === 0)
        return res.status(200).json({
          success: true,
          message: "unable to find user",
        });
      res
        .status(200)
        .json({ message: "Password updated successfully.", result });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const resendOtpRider = (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ message: "Mobile number is required." });
    }
    let email;

    connection.query(
      "select * from riders where mobile = ? ",
      [mobileNumber],
      (err, riders) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "error in db" + err.message,
          });
        if (riders.length < 1)
          return res.send("rider not found for these mobile number");

        email = riders[0].email;
        console.log(email);

        const newOtp = 123456;
        mailApi({
          useremail: email,
          fromName: "Admin Cafe_Cruises",
          app_name: "cafe_cruises",
          message: "please verify your otp with APP",
          subject: "otp conformation",
          app_logo: "",
          generateotp: newOtp,
        })
          .then("otp send to Email working nicely")
          .catch("error while sending otp on mail");

        connection.query(
          "update riders set otp = ? where mobile = ? ",
          [newOtp, mobileNumber],
          (err, result) => {
            if (err)
              return res.status(500).json({
                success: false,
                message: "DB Error in resend OTP Rider " + err.message,
              });

            res.status(200).json({
              success: true,
              message: "OTP Sended to Your Email",
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in resend OTP" + error.message,
    });
  }
};

// export const rentBike = (req, res) => {
//   const { bikeRent, bikeName, bikeModel } = req.body;
//   const { ownerId } = req.params;
//   const bikeImage = req.file ? req.file.filename : null;

//   const sql = `
// INSERT INTO BikesOnRent
// (bikeImage, bikeRent, bikeName, bikeModel, ownerId)
// VALUES (?, ?, ?, ?, ?)
// `;

//   connection.query(
//     sql,
//     [bikeImage, bikeRent, bikeName, bikeModel, ownerId],
//     (err, result) => {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({
//         message: "Bike listed for rent successfully",
//         bikeId: result.insertId,
//       });
//     }
//   );
// };

//  Get APIs

// export const getBikes = async (req, res) => {
//   connection.query(
//     "SELECT * FROM BikesOnRent ORDER BY createdAt DESC",
//     async (err, bikes) => {
//       if (err) return res.status(500).json({ error: err.message });

//       const enrichedBikes = await Promise.all(
//         bikes.map(async (bike) => {
//           return new Promise((resolve) => {
//             connection.query(
//               `SELECT firstName, lastName, email, mobile FROM riders WHERE id = ?`,
//               [bike.ownerId],
//               (err2, result) => {
//                 const owner = result ? result[0] : {};
//                 resolve({
//                   ...bike,
//                   owner: {
//                     name: `${owner.firstName || ""} ${owner.lastName || ""}`,
//                     email: owner.email,
//                     mobile: owner.mobile,
//                   },
//                 });
//               }
//             );
//           });
//         })
//       );
//       res.json(enrichedBikes);
//     }
//   );
// };

export const ClaimReimburished = async (req, res) => {
  try {
    const {
      claimType,
      riderId,
      claimAmount,
      fuelCosts,
      TollCharges,
      OtherExpenses,
    } = req.body;
    const RecieptImage = req.files ? req.files.RecieptImage[0].filename : null;
    const ChalanImage = req.files ? req.files.ChalanImage[0].filename : null;

    connection.query(
      "insert into claims(claimType,riderId,claimAmount,fuelCosts,TollCharges,OtherExpenses,RecieptImage,ChalanImage) Values (?,?,?,?,?,?,?,?);",
      [
        claimType,
        riderId,
        claimAmount,
        fuelCosts,
        TollCharges,
        OtherExpenses,
        RecieptImage,
        ChalanImage,
      ],
      (err, result) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "DB Error in submit Claim " + err.message,
          });
        res.status(200).json({
          success: true,
          message: "claim submited Successfully",
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in Claim Reimburished Ammount",
    });
  }
};
