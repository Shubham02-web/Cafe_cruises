import connection from "../../config/db.js";

export const getAllCities = (req, res) => {
  connection.query("SELECT * FROM city", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
};

export const getCityByName = (req, res) => {
  connection.query(
    "SELECT * FROM city where cityName = ? ",
    [req.params.cityName],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.send(results);
    }
  );
};

export const getBikes = async (req, res) => {
  console.log(req.params.id);
  connection.query(
    "SELECT id,bikeImage,bikeRent,bikeName,bikeModel,ownerId,cityId,isAdminApproved,manufecture,Manufecturing_Year FROM BikesOnRent where cityId = ? AND isAdminApproved = '1'  ORDER BY createdAt DESC",
    [req.params.id],
    async (err, bikes) => {
      if (err) return res.status(500).json({ error: err.message });

      const enrichedBikes = await Promise.all(
        bikes.map(async (bike) => {
          return new Promise((resolve) => {
            connection.query(
              `SELECT firstName, lastName, email, mobileNumber FROM users WHERE id = ?`,
              [bike.ownerId],
              (err2, result) => {
                const owner = result ? result[0] : {};
                resolve({
                  ...bike,
                  owner: {
                    name: `${owner.firstName || ""} ${owner.lastName || ""}`,
                    email: owner.email,
                    mobile: owner.mobileNumber,
                  },
                });
              }
            );
          });
        })
      );

      res.json(enrichedBikes);
    }
  );
};

export const getBikeDetailsById = async (req, res) => {
  connection.query(
    "SELECT * FROM BikesOnRent WHERE id = ? ORDER BY createdAt DESC",
    [req.params.id],
    async (err, bikes) => {
      if (err) return res.status(500).json({ error: err.message });

      const enrichedBikes = await Promise.all(
        bikes.map(async (bike) => {
          return new Promise((resolve) => {
            connection.query(
              `SELECT firstName, lastName, email, mobileNumber FROM users WHERE id = ?`,
              [bike.ownerId],
              (err2, result) => {
                const owner = result ? result[0] : {};
                resolve({
                  ...bike,
                  owner: {
                    name: `${owner.firstName || ""} ${owner.lastName || ""}`,
                    email: owner.email,
                    mobile: owner.mobileNumber,
                  },
                });
              }
            );
          });
        })
      );

      res.json(enrichedBikes);
    }
  );
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  connection.query(
    "Select * from users where id = ? ",
    [id],
    async (err, user) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: err.message,
        });

      return res.json({
        user,
      });
    }
  );
};

export const getInsuranceById = (req, res) => {
  const id = req.params.id;
  connection.query(
    `SELECT * FROM Insurance WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(404).json({ message: "Insurance not found" });
      res.status(200).json(results[0]);
    }
  );
};

export const getAllInsurance = (req, res) => {
  connection.query(`SELECT * FROM Insurance`, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

export const getFeed = (req, res) => {
  connection.query("SELECT * FROM feeds", (err, feedRes) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(feedRes);
  });
};

export const getTripDetails = async (req, res) => {
  // connection.query("SELECT * FROM feeds", (err, feeds) => {
  //   if (err)
  //     return res.status(500).json({
  //       success: false,
  //       message:
  //         "Error while fetching feeds details from getTripDetails" +
  //         err.message,
  //     });
  connection.query(
    "SELECT * FROM upcoming_rides where cityId = ? ",
    [req.params.cityId],
    (err, trips) => {
      if (err)
        return res.status(500).json({
          success: false,
          message:
            "Error in getTrip Details while geting Upcoming rides details" +
            err.message,
        });
      res.status(200).json({
        // feeds,
        upcomingTrips: trips,
      });
    }
  );
  // });
};

export const getUpcomingTripById = (req, res) => {
  const { id } = req.params;
  try {
    connection.query(
      "SELECT * FROM upcoming_rides WHERE id = ?",
      [id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!results.length) {
          return res.status(404).json({ message: "Trip not found" });
        }
        res.status(200).json({ trip: results[0] });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error fetching trip", error });
  }
};

export const fetchBikesByUserID = async (req, res) => {
  const { id } = req.params;
  console.log("heyo" + id);
  let sql =
    "select id,bikeImage,bikeRent,bikeName,bikeModel,ownerId,cityId,isAdminApproved,manufecture,Manufecturing_Year from bikesonrent where ownerId = ?";
  connection.query(sql, [id], (err, bikes) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "error in db" + err.message,
      });
    }
    console.log(bikes);
    if (bikes.length < 1) {
      return res.status(404).json({
        success: false,
        message: "you dont have any registerd bike",
      });
    }
    res.status(200).json({
      success: true,
      bikes,
    });
  });
};
