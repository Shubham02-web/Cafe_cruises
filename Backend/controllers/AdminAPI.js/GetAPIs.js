import { json } from "sequelize";
import connection from "../../config/db.js";

export const getAllCities = (req, res) => {
  try {
    connection.query("SELECT * FROM city", (err, results) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "DB error in getAllCities" + err.message,
        });
      res.status(200).json({ success: true, results });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in get All Cities",
    });
  }
};

export const getCityById = (req, res) => {
  try {
    const { id } = req.params;
    connection.query(
      "SELECT * FROM city WHERE id = ?",
      [id],
      (err, results) => {
        if (err)
          return res.status(500).json({
            success: true,
            message: "DB ERROR While finding cityById " + err,
            message,
          });
        if (results.length === 0)
          return res
            .status(200)
            .json({ success: true, message: "City not found for these id" });
        res.status(200).json({ success: true, results });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in get city By Id",
    });
  }
};

export const getAllRiders = (req, res) => {
  try {
    connection.query("SELECT * FROM riders;", (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "DB error while finding riders " + err.message,
        });
      }
      return res.status(200).json({ success: true, result });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in get ALL Riders",
    });
  }
};

export const getAllUsers = (req, res) => {
  try {
    connection.query("SELECT * FROM users", (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "DB error" + err });
      }
      return res.status(200).json({ success: true, users: result });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in get All Users API",
    });
  }
};

export const getAllInsurance = (req, res) => {
  try {
    connection.query(`SELECT * FROM Insurance`, (err, results) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "DB error in getAllInsurence " + err.message,
        });
      res.status(200).json({ success: true, results });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in get All Insurence" + error.message,
    });
  }
};

export const getInsuranceById = (req, res) => {
  try {
    const id = req.params.id;
    connection.query(
      `SELECT * FROM Insurance WHERE id = ?`,
      [id],
      (err, results) => {
        if (err)
          return res.status(500).json({
            success: true,
            message: "DB Error while get Insurence BY ID" + err.message,
          });
        if (results.length === 0)
          return res.status(404).json({
            success: true,
            message: "Insurance not found for these id",
          });
        res.status(200).json({ success: true, results });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching insurence by ID" + error.message,
    });
  }
};

export const getAllDataForAdminPage = (req, res) => {
  const result = {
    feeds: [],
    renterBikes: [],
    ongoingRides: [],
    upcomingRides: [],
  };

  try {
    connection.query("SELECT * FROM feeds", (err, feedRes) => {
      if (err)
        return res
          .status(500)
          .json({
            success: false,
            message:
              "DB ERROR while fetching feeds in getAllData " + err.message,
          });

      result.feeds = feedRes;

      connection.query("SELECT * FROM renter_bikes", (err, bikeRes) => {
        if (err)
          return res
            .status(500)
            .json({
              success: false,
              message:
                "DB Error while  fetching renters_bike in get ALL Data" +
                err.message,
            });

        result.renterBikes = bikeRes;

        connection.query("SELECT * FROM ongoing_rides", (err, ongoingRes) => {
          if (err)
            return res
              .status(500)
              .json({
                success: true,
                message:
                  "error while fetching ongoing_rides while fetching All data" +
                  err.message,
              });
          result.ongoingRides = ongoingRes;

          connection.query(
            "SELECT * FROM upcoming_rides",
            (err, upcomingRes) => {
              if (err)
                return res
                  .status(500)
                  .json({
                    success: false,
                    message:
                      "error while fetching upcoming_rides in getAll data " +
                      err.message,
                  });
              result.upcomingRides = upcomingRes;

              res.status(200).json({ success: true, result });
            }
          );
        });
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "error in getAllDataForAdminPage API " + error.message });
  }
};

export const getTotalBooking = async (req, res) => {
  let sql = "select * from bikebookings";
  connection.query(sql, (err, bookings) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Error in DB" + err.message,
      });
    if (bookings.length < 1) {
      return res.json({
        success: false,
        message: "no data found",
      });
    }
    res.status(200).json({
      success: true,
      bookings,
    });
  });
};

export const totalBikes = async (req, res) => {
  let sql = "select * from bikesonrent";
  connection.query(sql, (err, bikes) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Error In DB" + err.message,
      });
    if (bikes.length < 1)
      return res.json({
        success: false,
        message: "no data Found",
      });
    res.status(200).json({
      success: true,
      bikes,
    });
  });
};

export const getActiveRides = async (req, res) => {
  let sql = "select * from upcoming_rides where ride_status = 'ACTIVE'";
  connection.query(sql, (err, rides) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Error in DB " + err.message,
      });

    if (rides.length < 1) {
      return res.json({
        success: true,
        message: "no active rides",
      });
    }
    res.status(200).json({
      success: true,
      rides,
    });
  });
};

export const getAllPendingRequests = async (req, res) => {
  try {
    let finalArray = {};
    connection.query(
      `select * from bikesonrent where isAdminApproved = '0' `,
      (err, bikesonrent) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "error in db " + err.message,
          });

        finalArray = {
          ...finalArray,
          PendingbikesOnRent: bikesonrent,
        };

        connection.query(
          `select * from bikebookings where status = 'pending' `,
          (err, bookingbikes) => {
            if (err)
              return res.status(500).json({
                success: false,
                message: "error in db " + err.message,
              });
            finalArray = { ...finalArray, PendingBookingbikes: bookingbikes };

            connection.query(
              "select * from riders where isAdminVerified = '0' OR verification_status = 'pending'",
              (err, bookingBikes) => {
                if (err) {
                  return res.status(500).json({
                    success: false,
                    message: "error in DB " + err.message,
                  });
                }
                finalArray = { ...finalArray, PendingRides: bookingBikes };
                connection.query(
                  "select * from upcoming_rides where ride_status = 'PENDING'",
                  (err, upcoming_rides) => {
                    if (err)
                      return res.status(500).json({
                        success: false,
                        message: "Error in db " + err.message,
                      });
                    finalArray = {
                      ...finalArray,
                      pendingUpcomingRides: upcoming_rides,
                    };

                    connection.query(
                      "select * from users where Admin_approved = '0'",
                      (err, users) => {
                        if (err)
                          return res.status(500).json({
                            success: false,
                            message: "error in DB" + err.message,
                          });

                        finalArray = {
                          ...finalArray,
                          pendingUserRequest: users,
                        };

                        res.status(200).json({
                          success: true,
                          finalArray,
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
  } catch (err) {
    res.json({
      success: false,
      message: "error in getAllPending Request",
    });
  }
};

export const getDeletedRiders = async (req, res) => {
  try {
    connection.query(
      "select * from riders where isDeleted = '1'",
      (err, deletedRider) => {
        if (err)
          return res.status(500).send({
            success: false,
            message: "Error in DB " + err.message,
          });

        if (deletedRider.length < 1)
          return res.json({
            message: "no deleted rider found",
          });
        res.status(200).json({
          success: true,
          deletedRider,
        });
      }
    );
  } catch (err) {
    return res.json({
      success: false,
      message: "Error in getDeleted Riders",
    });
  }
};

export const getDeletedUsers = async (req, res) => {
  try {
    connection.query(
      "select * from users where isDeleted = '1'",
      (err, users) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "Error in DB " + err.message,
          });
        if (users.length < 1) {
          return res.json({
            success: false,
            message: "no delted users found",
          });
        }

        res.status(200).json({
          success: true,
          users,
        });
      }
    );
  } catch (error) {
    res.json({
      success: false,
      message: "error in getDeleted Users" + error.message,
    });
  }
};

export const getPendingApprovedBikes = async (req, res) => {
  try {
    connection.query(
      "select * from bikesonrent where isAdminApproved = '0'",
      (err, bikes) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "error in get PendingApprovalBikes " + err.message,
          });
        if (bikes.length < 1) {
          return res.json({
            success: false,
            message: "no bike has panding status",
          });
        }

        res.status(200).json({
          success: true,
          bikes,
        });
      }
    );
  } catch (error) {
    res.json({
      success: false,
      message: "error in getPendingApprovedBikes" + error.message,
    });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    connection.query(
      "select * from users where Admin_approved = '0'",
      (err, users) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "DB error in getPendingStatus Users" + err.message,
          });
        if (users.length < 1)
          return res.json({
            success: false,
            message: "no user is in pending state",
          });
        res.status(200).json({
          success: true,
          users,
        });
      }
    );
  } catch (error) {
    return res.json({
      success: false,
      message: "error in get pending users",
    });
  }
};

export const getPendingRiders = async (req, res) => {
  try {
    connection.query(
      "select * from riders where isAdminVerified='0' OR  verification_status = 'pending'",
      (err, riders) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "DB Error in getPendingRiders API" + err.message,
          });
        if (riders.length < 1) {
          return res.json({
            success: false,
            message: "No rider is in pending state",
          });
        }
        res.status(200).json({
          success: true,
          riders,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getPendingRidersAPI",
    });
  }
};

export const getCompletedRides = async (req, res) => {
  try {
    let sql = "select * from upcoming_rides where ride_status = 'COMPLETED'";
    connection.query(sql, (err, rides) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "DB Error on completedRides API " + err.message,
        });
      if (rides.length < 1)
        return res.json({
          success: false,
          message: "No Completed Rides founded",
        });
      res.status(200).json({
        success: true,
        rides,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in getCompletedRides",
    });
  }
};

export const getAllPendingRides = async (req, res) => {
  try {
    let sql = "select * from upcoming_rides where ride_status = 'PENDING'";
    connection.query(sql, (err, result) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "DB Error in get Pending rides " + err.message,
        });
      if (result.length < 1) {
        res.json({
          success: false,
          message: "No pending rides found",
        });
      }
      res.status(200).json({
        success: true,
        result,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in getAllPendingRides API",
    });
  }
};

export const getTotalEarning = async (req, res) => {
  try {
    let total_bikePayment = [];
    let total_insurenctAmount = [];
    let total_tripCommision = [];

    connection.query(
      "select paymentAmount,insurence_id from bikebookings",
      (err, bookBike) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "DB error in get total earning " + err.message,
          });
        if (bookBike.length < 1)
          return res.status(200).json({
            success: true,
            message: "no record found for the booked bikes",
          });
        for (let i = 0; i < bookBike.length; i++) {
          total_bikePayment.push(bookBike[i].paymentAmount / 10);
        }

        for (let i = 0; i < bookBike.length; i++) {
          connection.query(
            "select insuranceAmount from insurance where id = ? ",
            [bookBike[i].insurence_id],
            (err, insurenceAmount) => {
              if (err)
                return res.status(500).json({
                  success: false,
                  message: "DB error in select insurence AMOUNT " + err.message,
                });
              if (insurenceAmount.length < 0)
                return res.status(500).json({
                  success: false,
                  message: "no insurence Amount founded for it ",
                });

              for (let element of insurenceAmount) {
                total_insurenctAmount.push(element.insuranceAmount / 10);
              }
            }
          );
        }

        connection.query(
          "select traveller , payment from upcoming_rides where ride_status = 'COMPLETED'",
          (err, ride) => {
            if (err)
              return res.status(500).json({
                success: false,
                message:
                  "DB error in get total earning ongoin_ride" + err.message,
              });
            if (ride.length < 1)
              return res.status(200).json({
                success: true,
                message: "No Completed Ride Found",
              });

            for (let i = 0; i < ride.length; i++) {
              let travllerString = ride[i].traveller;
              let StringTrav = JSON.parse(travllerString);
              let travellerLen = StringTrav.length;
              total_tripCommision.push((ride[i].payment * travellerLen) / 10);
            }

            const sumOfTotalTrip = total_tripCommision.reduce(
              (acc, curentValue) => acc + curentValue,
              0
            );

            const sumOfInsurence = total_insurenctAmount.reduce(
              (acc, crv) => acc + crv,
              0
            );

            const sumOfTotelBikePayment = total_bikePayment.reduce(
              (acc, crv) => acc + crv,
              0
            );

            const SUM = sumOfTotalTrip + sumOfInsurence + sumOfTotelBikePayment;

            console.log("total Sum : " + SUM);
            console.log("Sum of bikes : " + sumOfTotelBikePayment);
            console.log("Sum Of Insurence : " + sumOfInsurence);
            console.log("Sum of TotalTrip : " + sumOfTotalTrip);

            res.status(200).json({
              success: true,
              "total Sum  ": SUM,
              "Sum of bikes  ": sumOfTotelBikePayment,
              "Sum Of Insurence  ": sumOfInsurence,
              "Sum of TotalTrip  ": sumOfTotalTrip,
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "error in getTotalEarning API",
    });
  }
};

export const getRidersPerformance = async (req, res) => {
  try {
    connection.query(
      "select AVG(reviewStar) as avg_performance from upcoming_rides where ride_leader = ? AND ride_status = 'COMPLETED' ",
      [req.params.id],
      (err, result) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "DB Error in getRiderPerformance " + err.message,
          });
        if (result.length < 1)
          return res.status(200).json({
            success: true,
            message: "No review found",
          });

        let performance = result[0].avg_performance;

        res.status(200).json({
          success: true,
          Performance: `rider Performancce is ${performance} out of 5`,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in getRidersPerformance API",
    });
  }
};

export const totalReimburishedAmount = async (req, res) => {
  try {
    let sql =
      "select SUM(claimAmount) as total_Amount from claims where Admin_Approval = '1'";
    connection.query(sql, (err, result) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "DB ERROR selectin Claim Amount" + err.message,
        });
      console.log(result[0].total_Amount);
      let TotalAmount = result[0].total_Amount;
      res.status(200).json({
        success: true,
        TotalAmount,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in get total Reimburished Amount",
    });
  }
};
