import bcrypt from "bcryptjs";
import generateOTP from "../../middlewares/OTPGenrator.js";
import {
    createUser,
    findUserByMobile,
    updateOtpByMobile,
    resendOtpByMobile,
    updatePasswordByMobile,
} from "../../models/userModels.js";
import connection from "../../config/db.js";
import mailApi from "../../middlewares/MailAPI.js";

const register = async(req, res) => {
    const { firstName, lastName, mobileNumber, email, password, bio, cityId } =
    req.body;

    if ((!firstName || !lastName || !mobileNumber || !email || !password, !bio)) {
        return res.status(400).json({ message: "All fields are required." });
    }

    let role = "user";
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = "123456";
        let sql =
            "insert into users(firstName,lastName,mobileNumber,email,password,otp,role,bio,cityId) VALUES (?,?,?,?,?,?,?,?,?)";

        connection.query(
            sql, [
                firstName,
                lastName,
                mobileNumber,
                email,
                hashedPassword,
                otp,
                role,
                bio,
                cityId,
            ],
            (err, result) => {
                if (err)
                    return res.status(500).json({
                        success: false,
                        message: "DB Error While Inserting Values for user " + err.message,
                    });

                mailApi({
                        useremail: email,
                        fromName: "Admin Cafe_Cruises",
                        app_name: "cafe_cruises",
                        message: "please verify your otp with APP",
                        subject: "otp conformation",
                        app_logo: "",
                        generateotp: otp,
                    })
                    .then({ success: true, message: "otp send to Email working nicely" })
                    .catch({ success: false, message: "error while sending otp on mail" });

                return res.status(201).json({
                    message: "User registered. please check your Email and conform OTP",
                    otp,
                });
            }
        );
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Server error." });
    }
};

const verifyOtpController = (req, res) => {
    const { mobileNumber, otp } = req.body;

    let sql = "select firstName  from users where mobileNumber = ? AND otp = ?";
    connection.query(sql, [mobileNumber, otp], async(err, result) => {
        if (err)
            return res.status(500).json({
                success: false,
                message: "Error in DB" + err.message,
            });
        if (result.length < 1)
            return res.status(404).json({
                success: false,
                message: "Data Not Found | Invalid Email or OTP",
            });

        connection.query(
            "update users set isVerified ='1' where mobileNumber = ? ", [mobileNumber],
            (err, result) => {
                if (err)
                    return res.status(500).json({
                        success: false,
                        message: "DB Error while updating is verified true for user" + err.message,
                    });
            }
        );

        res.status(200).json({
            success: true,
            message: "OTP Verified Successfully Welcome ",
            result,
        });
    });
};
const login = (req, res) => {
    const { email } = req.body;
    let otp = "123456";
    if (!email) {
        return res.status(400).json({ message: " please Enter Email" });
    }

    let sql = "SELECT * FROM users where email = ?";
    connection.query(sql, [email], async(err, user) => {
        if (err)
            return res.status(500).json({
                success: false,
                message: "Error in DB " + err.message,
            });

        if (user.length < 1)
            return res.json({
                success: false,
                message: "data not found",
            });

        if (user.length > 0) {
            mailApi({
                    useremail: email,
                    fromName: "Admin Cafe_Cruises",
                    app_name: "cafe_cruises",
                    message: "please verify your otp with APP",
                    subject: "otp conformation",
                    app_logo: "",
                    generateotp: otp,
                })
                .then({ message: "otp send to Email working nicely" })
                .catch({ success: false, message: "error while sending otp on mail" });

            let sql = "update users set otp = ? where email = ? ";
            connection.query(sql, [otp, email], async(err, result) => {
                if (err)
                    return res.json({
                        success: false,
                        message: "Error in DB " + err.message,
                    });
                if (result.length < 1)
                    res.json({
                        success: false,
                        message: "Data not found",
                    });
                res.status(200).json({
                    success: true,
                    message: "Please Do OTP Verification For Log In , otp sended to your email",
                });
            });
        }
    });
};

export const loginOTPVerification = async(req, res) => {
    const { mobileNumber, otp } = req.body;
    if ((!mobileNumber, !otp))
        return res.send({
            message: "mobile and otp both field are required",
        });

    let sql = "SELECT * FROM users WHERE mobileNumber = ? AND otp =  ?";

    connection.query(sql, [mobileNumber, otp], async(err, result) => {
        if (err)
            return res.status(500).json({
                success: false,
                message: "Error in DB" + err.message,
            });
        if (result.length < 1)
            return res.status(404).json({
                success: "false",
                message: "Data Not Found",
            });
        res.status(200).json({
            success: true,
            message: "Login Successfully | Wel Come User",
            result,
        });
    });
};

const forgotPasswordSendOtp = (req, res, next) => {
    const { email } = req.body;
    let otp = "123456";
    if (!email) {
        return res.status(400).json({ message: "email is required." });
    }

    let sql = "SELECT * FROM users where email = ? ";
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
            let sql = "update users set otp = ? where email = ?";
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
};

const resetPassword = async(req, res) => {
    const { mobileNumber, otp, newPassword } = req.body;

    if (!newPassword || !otp || !mobileNumber) {
        return res.status(400).json({ message: "please enter all fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        connection.query(
            "select otp from users where mobileNumber = ? ", [mobileNumber],
            (err, result) => {
                if (err)
                    return res.status(500).json({
                        success: false,
                        message: "DB Error otp verification on reset password" + err.message,
                    });
                if (result.length < 1)
                    return res.status(500).json({
                        success: false,
                        message: "no user found for these mobile number",
                    });
                if (result[0].otp != otp)
                    return res.status(500).json({
                        success: false,
                        message: "OTP mismatched",
                    });

                let sql = "update users set password = ? where mobileNumber = ? ";
                connection.query(sql, [hashedPassword, mobileNumber], (err, result) => {
                    if (err)
                        return res.status(500).json({
                            success: false,
                            message: "DB Error in ResetPass" + err.message,
                        });
                    res.status(200).json({
                        success: true,
                        message: "password updated successfully",
                    });
                });
            }
        );
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Server error." });
    }
};

const resendOtp = (req, res) => {
    try {
        const { email } = req.body;
        const newOtp = 123456;

        if (!email) {
            return res.status(400).json({ message: "email is required." });
        }

        let sql = "select mobileNumber from users where email = ? ";
        connection.query(sql, [email], (err, result) => {
            if (err)
                return res.status(500).json({
                    success: false,
                    message: "DB ERROR in resend OTP for users",
                });
            if (result.length < 1)
                return res.status(200).json({
                    success: true,
                    message: "User not found for these email",
                });

            if (result.length > 0) {
                let sql = "update users set otp = ? where email = ?";
                connection.query(sql, [newOtp, email], (err, user) => {
                    if (err)
                        return res.status(500).json({
                            success: false,
                            message: "error in DB" + err.message,
                        });
                    if (user.length < 1)
                        return res
                            .status(200)
                            .json({ success: false, message: "user not found" });
                });
            }

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

            res.status(200).json({
                success: true,
                message: "Re-Sended OTP to Your Email",
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in resned OTP",
        });
    }
};
export const rentBike = (req, res) => {
    const {
        bikeRent,
        bikeName,
        bikeModel,
        cityId,
        Manufecturing_Year,
        manufecture,
    } = req.body;
    const bikeImage = req.file ? req.file.filename : null;
    const ownerId = req.params.id;
    const sql = `
INSERT INTO BikesOnRent 
(bikeImage, bikeRent, bikeName, bikeModel, ownerId , cityId,Manufecturing_Year,manufecture,isAdminApproved) 
VALUES (?, ?, ?, ?, ? , ? , ?,?,'0');
`;

    connection.query(
        sql, [
            bikeImage,
            bikeRent,
            bikeName,
            bikeModel,
            ownerId,
            cityId,
            Manufecturing_Year,
            manufecture,
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                message: "Bike listed for rent successfully",
                bikeId: result.insertId,
            });
        }
    );
};

export const bookRide = (req, res) => {
    const { id } = req.params;
    const { from, to, distance } = req.body;
    const paymentAmount = Math.floor(Math.random() * (300 - 100 + 1) + 100); // e.g. 100 - 300
    const otp = "123456";

    connection.query(
        `INSERT INTO RideBookingTemp (fromLocation, toLocation, distance, paymentAmount, otp, userId) VALUES (?, ?, ?, ?, ?, ?)`, [from, to, distance, paymentAmount, otp, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: "Ride initiated", paymentAmount, otp });
        }
    );
};

// export const confirmRidePayment = (req, res) => {
//   res.status(200).json({
//     message: "Payment received successfully, please verify OTP",
//     otp: "123456",
//   });
// };

// export const verifyRideOtp = (req, res) => {
//   const { otp, userId } = req.body;

//   if (otp !== "123456") {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }

//   connection.query(
//     `SELECT * FROM RideBookingTemp WHERE userId = ?`,
//     [userId],
//     (err, rides) => {
//       if (err) return res.status(500).json({ error: err.message });
//       if (!rides.length)
//         return res.status(404).json({ message: "No ride found" });

//       const ride = rides[0];

//       connection.query(
//         `SELECT id, firstName, lastName, email, mobileNumber, my_rides FROM users WHERE id = ?`,
//         [userId],
//         (err2, users) => {
//           if (err2) return res.status(500).json({ error: err2.message });

//           const user = users[0];
//           const userInfo = {
//             name: `${user.firstName} ${user.lastName}`,
//             email: user.email,
//             mobile: user.mobileNumber,
//           };

//           const rideDetails = {
//             from: ride.fromLocation,
//             to: ride.toLocation,
//             distance: ride.distance,
//             paymentAmount: ride.paymentAmount,
//             user: userInfo,
//             status: "Pending",
//           };

//           // 1. Update all riders' ride array
//           connection.query(`SELECT id, rides FROM riders`, (err3, riders) => {
//             if (err3) return res.status(500).json({ error: err3.message });

//             for (const rider of riders) {
//               let updatedRides = [];
//               try {
//                 updatedRides = JSON.parse(rider.rides || "[]");
//               } catch (e) {}

//               updatedRides.push(rideDetails);

//               connection.query("UPDATE riders SET rides = ? WHERE id = ?", [
//                 JSON.stringify(updatedRides),
//                 rider.id,
//               ]);
//             }

//             // 2. Update user's my_rides array
//             let userRides = [];
//             try {
//               userRides = JSON.parse(user.my_rides || "[]");
//             } catch (e) {}

//             userRides.push({
//               ...rideDetails,
//               riders: riders.map((r) => ({ id: r.id })), // You can include more rider details here if needed
//             });

//             connection.query(
//               "UPDATE users SET my_rides = ? WHERE id = ?",
//               [JSON.stringify(userRides), userId],
//               (err4) => {
//                 if (err4) return res.status(500).json({ error: err4.message });

//                 res.status(200).json({
//                   message: "Ride booked successfully & all data updated!",
//                 });
//               }
//             );
//           });
//         }
//       );
//     }
//   );
// };

export const BookBikeAPI = async(req, res) => {
    const { userId, bikeId, bookingDate, insurence_id } = req.body;
    console.log(req.files);
    const licenseImage = req.files ? req.files.licenseImage[0].filename : null;
    const idCardImage = req.files ? req.files.idCardImage[0].filename : null;

    let paymentAmount = 1000;

    if (new Date(bookingDate) <= new Date()) {
        return res
            .status(400)
            .json({ message: "Booking  date must be a future date" });
    }

    const tempBooking = {
        userId,
        bikeId,
        bookingDate,
        licenseImage,
        idCardImage,
        insurence_id,
        paymentAmount,
        otp: "123456",
    };

    connection.query("INSERT INTO bikebookings SET ?", tempBooking, (err) => {
        if (err)
            return res.status(500).json({
                success: false,
                message: "DB Error " + err.message,
            });
        res
            .status(200)
            .json({ message: "Please complete your payment to proceed" });
    });
};

export const conformPaymentBook = async(req, res) => {
    res.status(200).json({ message: "OTP sent", otp: "123456" });
};

export const OTPForBikeBook = async(req, res) => {
    const { userId, otp } = req.body;

    connection.query(
        "select otp from bikebookings where userId = ? ", [userId],
        (err, result) => {
            if (err)
                return res.status(500).json({
                    success: false,
                    message: "Error in DB on otp bikebookings" + err.message,
                });
            if (result.length < 1)
                return res.status(200).json({
                    success: false,
                    message: "no booked bikes found for these user ",
                });
            if (otp != result[0].otp)
                return res.status(500).json({
                    success: false,
                    message: "OTP Not Found",
                });

            connection.query(
                "SELECT * FROM bikebookings WHERE userId = ?", [userId],
                (err, bookings) => {
                    if (err) return res.status(500).json({ error: err.message });
                    if (!bookings.length)
                        return res.status(404).json({ message: "No booking found" });

                    const booking = bookings[0];

                    connection.query(
                        "SELECT * FROM bikesonrent WHERE id = ?", [booking.bikeId],
                        (err2, bikeResults) => {
                            if (err2) return res.status(500).json({ error: err2.message });
                            if (!bikeResults.length)
                                return res.status(404).json({ message: "Bike not found" });

                            const bike = bikeResults[0];

                            connection.query(
                                "SELECT id, firstName, lastName, email, mobileNumber FROM users WHERE id = ?", [userId],

                                (err3, userResults) => {
                                    if (err3)
                                        return res.status(500).json({ error: err3.message });
                                    const user = userResults[0];

                                    const userData = {
                                        id: user.id,
                                        name: `${user.firstName} ${user.lastName}`,
                                        email: user.email,
                                        mobile: user.mobileNumber,
                                    };

                                    connection.query(
                                        "SELECT id, firstName, lastName, email, mobileNumber FROM users WHERE id = ?", [bike.ownerId],
                                        (err4, ownerUsers) => {
                                            if (err4)
                                                return res.status(500).json({ error: err4.message });

                                            const updateAllBookings = (owner) => {
                                                const ownerData = {
                                                    id: owner.id,
                                                    name: `${owner.firstName} ${owner.lastName}`,
                                                    email: owner.email,
                                                    mobile: owner.mobileNumber,
                                                };

                                                const userSummary = {
                                                    id: user.id,
                                                    name: `${user.firstName} ${user.lastName}`,
                                                    email: user.email,
                                                    mobile: user.mobileNumber,
                                                };

                                                const bikeSummary = {
                                                    bikeId: bike.id,
                                                    bikeName: bike.bikeName,
                                                    bikeModel: bike.bikeModel,
                                                    rent: bike.rentPerDay,
                                                    bookingDate: booking.bookingDate,
                                                };

                                                const userSideBooking = {
                                                    ...bikeSummary,
                                                    owner: ownerData,
                                                };

                                                const ownerSideBooking = {
                                                    ...bikeSummary,
                                                    user: userSummary,
                                                };

                                                connection.query(
                                                    "SELECT bookedBike FROM users WHERE id = ?", [userId],
                                                    (err5, resultUser) => {
                                                        let userBookings = [];
                                                        try {
                                                            let bookedBikeData = "[]";
                                                            if (
                                                                resultUser.length &&
                                                                resultUser[0].bookedBike
                                                            ) {
                                                                bookedBikeData = resultUser[0].bookedBike;
                                                            }
                                                            userBookings = JSON.parse(bookedBikeData);
                                                        } catch {}
                                                        userBookings.push(userSideBooking);
                                                        connection.query(
                                                            "UPDATE users SET bookedBike = ? WHERE id = ?", [JSON.stringify(userBookings), userId]
                                                        );
                                                    }
                                                );

                                                const ownerTable = ownerUsers.length ?
                                                    "users" :
                                                    "riders";
                                                connection.query(
                                                    `SELECT bookedBike FROM ${ownerTable} WHERE id = ?`, [owner.id],
                                                    (err6, resultOwner) => {
                                                        let ownerBookings = [];
                                                        try {
                                                            let ownerBookedData = "[]";
                                                            if (
                                                                resultOwner.length &&
                                                                resultOwner[0].bookedBike
                                                            ) {
                                                                ownerBookedData = resultOwner[0].bookedBike;
                                                            }
                                                            ownerBookings = JSON.parse(ownerBookedData);
                                                        } catch {}
                                                        ownerBookings.push(ownerSideBooking);
                                                        connection.query(
                                                            `UPDATE ${ownerTable} SET bookedBike = ? WHERE id = ?`, [JSON.stringify(ownerBookings), owner.id]
                                                        );
                                                    }
                                                );

                                                connection.query(
                                                    "SELECT bookedBike FROM bikesonrent WHERE id = ?", [bike.id],
                                                    (err7, bikeResult) => {
                                                        let bikeBookings = [];
                                                        try {
                                                            let bikeBookedData = "[]";
                                                            if (
                                                                bikeResult.length &&
                                                                bikeResult[0].bookedBike
                                                            ) {
                                                                bikeBookedData = bikeResult[0].bookedBike;
                                                            }
                                                            bikeBookings = JSON.parse(bikeBookedData);
                                                        } catch {}
                                                        const fullBooking = {
                                                            ...bikeSummary,
                                                            user: userSummary,
                                                            owner: ownerData,
                                                        };
                                                        bikeBookings.push(fullBooking);
                                                        connection.query(
                                                            "UPDATE bikesonrent SET bookedBike = ? WHERE id = ?", [JSON.stringify(bikeBookings), bike.id]
                                                        );
                                                    }
                                                );

                                                return res.status(200).json({
                                                    message: "Your bike has been booked successfully!",
                                                });
                                            };

                                            if (ownerUsers.length) {
                                                updateAllBookings(ownerUsers[0]);
                                            } else {
                                                connection.query(
                                                    "SELECT id, firstName, lastName, email, mobileNumber FROM riders WHERE id = ?", [bike.ownerId],
                                                    (err5, riderResults) => {
                                                        if (err5)
                                                            return res
                                                                .status(500)
                                                                .json({ error: err5.message });
                                                        if (!riderResults.length)
                                                            return res
                                                                .status(404)
                                                                .json({ message: "Owner not found" });

                                                        updateAllBookings(riderResults[0]);
                                                    }
                                                );
                                            }
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

export const initiateTripJoin = (req, res) => {
    const { upcomingTripId } = req.body;

    connection.query(
        "SELECT * FROM upcoming_rides WHERE id = ?", [upcomingTripId],
        (err, tripResults) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!tripResults.length)
                return res.status(404).json({ message: "Trip not found" });

            const trip = tripResults[0];
            const { traveller, ...tripWithoutTraveller } = trip;

            const paymentAmount = trip.payment;

            res.status(200).json({
                message: `To join this trip, please complete the payment of ₹${paymentAmount}`,
                paymentAmount: paymentAmount,
                tripDetails: tripWithoutTraveller,
            });
        }
    );
};

export const confirmTripPayment = (req, res) => {
    res.status(200).json({
        message: "Payment received. Please verify with OTP to join the trip.",
        otp: "123456",
    });
};

export const verifyTripOTP = (req, res) => {
    const { upcomingTripId, userId, otp } = req.body;

    if (otp !== "123456") {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    connection.query(
        "select Admin_approved from users where id = ? ", [userId],
        (err, result) => {
            if (err)
                return res.status(500).json({
                    success: false,
                    message: "error in db while checking admin verification " + err.message,
                });
            if (result[0].Admin_approved != "1")
                return res.status(500).json({
                    success: false,
                    message: "You are not verified by admin please wait for verification either your amount will be refund soon",
                });

            connection.query(
                "SELECT * FROM upcoming_rides WHERE id = ?", [upcomingTripId],
                (err, tripResults) => {
                    if (err) return res.status(500).json({ error: err.message });
                    if (!tripResults.length)
                        return res.status(404).json({ message: "Trip not found" });

                    const trip = tripResults[0];

                    let existingTravellers = [];
                    try {
                        existingTravellers = trip.traveller ?
                            JSON.parse(trip.traveller) : [];
                    } catch {
                        existingTravellers = [];
                    }

                    if (existingTravellers.length >= trip.members) {
                        return res
                            .status(400)
                            .json({ message: "Trip is full. Please join another one." });
                    }

                    connection.query(
                        "SELECT id, firstName, lastName, email, mobileNumber FROM users WHERE id = ?", [userId],
                        (err2, userResults) => {
                            if (err2) return res.status(500).json({ error: err2.message });
                            if (!userResults.length)
                                return res.status(404).json({ message: "User not found" });

                            const user = userResults[0];
                            const userInfo = {
                                id: user.id,
                                name: `${user.firstName} ${user.lastName}`,
                                email: user.email,
                                mobile: user.mobileNumber,
                            };

                            const tripSummary = {
                                tripId: trip.id,
                                title: trip.title,
                                from: trip.startLocation,
                                to: trip.endLocation,
                                date: trip.rideDate,
                                time: trip.rideTime,
                                payment: trip.payment,
                            };

                            if (!existingTravellers.some((u) => u.id === user.id)) {
                                existingTravellers.push(userInfo);
                                connection.query(
                                    "UPDATE upcoming_rides SET traveller = ? WHERE id = ?", [JSON.stringify(existingTravellers), upcomingTripId]
                                );
                            }

                            connection.query(
                                "SELECT my_trip FROM users WHERE id = ?", [userId],
                                (err3, myTripResults) => {
                                    if (err3)
                                        return res.status(500).json({ error: err3.message });

                                    let myTrips = [];
                                    let existingTrip;

                                    let tripData = [];

                                    if (myTripResults[0] && myTripResults[0].my_trip) {
                                        try {
                                            tripData = JSON.parse(myTripResults[0].my_trip);
                                        } catch (err) {
                                            tripData = [];
                                        }
                                    }

                                    myTrips = tripData;
                                    existingTrip = myTrips.find(
                                        (t) => t.tripId === tripSummary.tripId
                                    );

                                    if (!existingTrip) {
                                        myTrips.push({
                                            ...tripSummary,
                                            travellers: existingTravellers,
                                        });
                                    } else {
                                        existingTrip.travellers = existingTravellers;
                                    }

                                    connection.query(
                                        "UPDATE users SET my_trip = ? WHERE id = ?", [JSON.stringify(myTrips), userId],
                                        (updateErr) => {
                                            if (updateErr)
                                                return res
                                                    .status(500)
                                                    .json({ error: updateErr.message });

                                            connection.query(
                                                "SELECT id, my_trip FROM users",
                                                (errUsers, userList) => {
                                                    if (errUsers) {
                                                        console.error("User list fetch error:", errUsers);
                                                        return res.status(200).json({
                                                            message: "Trip joined, but sync failed for others.",
                                                        });
                                                    }

                                                    userList.forEach((usr) => {
                                                        let updated = false;
                                                        let trips = [];

                                                        try {
                                                            trips = usr.my_trip ?
                                                                JSON.parse(usr.my_trip) : [];
                                                        } catch {
                                                            trips = [];
                                                        }

                                                        trips = trips.map((t) => {
                                                            if (t.tripId === tripSummary.tripId) {
                                                                updated = true;
                                                                return {
                                                                    ...t,
                                                                    travellers: existingTravellers,
                                                                };
                                                            }
                                                            return t;
                                                        });

                                                        if (updated) {
                                                            connection.query(
                                                                "UPDATE users SET my_trip = ? WHERE id = ?", [JSON.stringify(trips), usr.id],
                                                                (errUpdate) => {
                                                                    if (errUpdate) {
                                                                        console.error(
                                                                            `Failed to update user ${usr.id}`,
                                                                            errUpdate.message
                                                                        );
                                                                    }
                                                                }
                                                            );
                                                        }
                                                    });

                                                    return res.status(200).json({
                                                        message: "Trip joined successfully and all users updated!",
                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

export const submitReview = (req, res) => {
    const { userId, targetType, targetId, review, reviewStar } = req.body;

    if (!review || !targetType || !userId || !targetId || !reviewStar) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    connection.query(
        "SELECT my_rides, bookedBike, my_trip, my_rewards FROM users WHERE id = ?", [userId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!result.length)
                return res.status(404).json({ message: "User not found" });

            let userData = result[0];
            let myRides = [];
            let bookedBikes = [];
            let myTrips = [];
            let myRewards = [];

            try {
                myRides = userData.my_rides ? JSON.parse(userData.my_rides) : [];
                bookedBikes = userData.bookedBike ?
                    JSON.parse(userData.bookedBike) : [];
                myTrips = userData.my_trip ? JSON.parse(userData.my_trip) : [];
                myRewards = userData.my_rewards ? JSON.parse(userData.my_rewards) : [];
            } catch (parseErr) {
                return res.status(500).json({
                    error: "Failed to parse user data",
                    details: parseErr.message,
                });
            }

            const rewardAmount = Math.floor(Math.random() * (500 - 10 + 1)) + 10;

            const updateUser = () => {
                myRewards.push({
                    amount: rewardAmount,
                    type: targetType,
                    reviewedOn: new Date().toISOString(),
                });

                connection.query(
                    "UPDATE users SET my_rides = ?, bookedBike = ?, my_trip = ?, my_rewards = ? WHERE id = ?", [
                        JSON.stringify(myRides),
                        JSON.stringify(bookedBikes),
                        JSON.stringify(myTrips),
                        JSON.stringify(myRewards),
                        userId,
                    ],
                    (updateErr) => {
                        if (updateErr)
                            return res.status(500).json({ error: updateErr.message });

                        res.status(200).json({
                            message: `Review submitted successfully! You've earned ₹${rewardAmount}!`,
                            reward: rewardAmount,
                        });
                    }
                );
            };

            if (targetType === "ride") {
                const ride = myRides.find(
                    (r) => r.from === targetId || r.to === targetId
                );
                if (!ride) return res.status(404).json({ message: "Ride not found" });

                ride.review = review;
                ride.reviewStar = reviewStar;
                return updateUser();
            }

            if (targetType === "bike") {
                const bike = bookedBikes.find((b) => b.bikeName === targetId);
                if (!bike) return res.status(404).json({ message: "Bike not found" });

                connection.query(
                    "UPDATE bikesonrent SET review = ?, reviewStar = ? WHERE id = ?", [review, reviewStar, targetId],
                    (err) => {
                        if (err)
                            return res.status(500).json({
                                success: false,
                                message: "DB Error at bikesonrent : " + err.message,
                            });
                        updateUser();
                    }
                );
                return;
            }

            if (targetType === "trip") {
                const trip = myTrips.find((t) => t.tripId === parseInt(targetId));
                if (!trip) return res.status(404).json({ message: "Trip not found" });

                connection.query(
                    "UPDATE upcoming_rides SET reviews = ?, reviewStar = ? WHERE id = ?", [review, reviewStar, targetId],
                    (err) => {
                        if (err)
                            return res.status(500).json({
                                success: false,
                                message: "DB Error at upcoming_bikes: " + err.message,
                            });
                        updateUser();
                    }
                );
                return;
            }

            return res.status(400).json({ message: "Invalid targetType" });
        }
    );
};

export {
    register,
    verifyOtpController,
    login,
    forgotPasswordSendOtp,
    resetPassword,
    resendOtp,
};