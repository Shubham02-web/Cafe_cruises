import connection from "../../config/db.js";

export const getAllCities = (req, res) => {
  connection.query("SELECT * FROM city", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
};

export const getCityById = (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM city WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0)
      return res.status(404).send({ message: "City not found" });
    res.send(results[0]);
  });
};

export const getAllRiders = (req, res) => {
  connection.query(
    "SELECT * FROM users WHERE role = 'rider'",
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({ users: result });
    }
  );
};

export const getAllUsers = (req, res) => {
  connection.query("SELECT * FROM users WHERE role = 'user'", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({ users: result });
  });
};

export const getAllInsurance = (req, res) => {
  connection.query(`SELECT * FROM Insurance`, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
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

export const getAllDataForAdminPage = (req, res) => {
  const result = {
    feeds: [],
    renterBikes: [],
    ongoingRides: [],
    upcomingRides: [],
  };

  try {
    connection.query("SELECT * FROM feeds", (err, feedRes) => {
      if (err) return res.status(500).json({ error: err });

      result.feeds = feedRes;

      connection.query("SELECT * FROM renter_bikes", (err, bikeRes) => {
        if (err) return res.status(500).json({ error: err });

        result.renterBikes = bikeRes;

        connection.query("SELECT * FROM ongoing_rides", (err, ongoingRes) => {
          if (err) return res.status(500).json({ error: err });
          result.ongoingRides = ongoingRes;

          connection.query(
            "SELECT * FROM upcoming_rides",
            (err, upcomingRes) => {
              if (err) return res.status(500).json({ error: err });
              result.upcomingRides = upcomingRes;

              res.status(200).json(result);
            }
          );
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." + error.message });
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
