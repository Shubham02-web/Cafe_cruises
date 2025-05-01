import connection from "../../config/db.js";

export const getTripDetails = async (req, res) => {
  try {
    connection.query(
      "SELECT * FROM upcoming_rides where cityId = ? order by id desc ",
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
          upcomingTrips: trips,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in getTrip Details" + error.message,
    });
  }
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
