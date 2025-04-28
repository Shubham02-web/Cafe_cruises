import connection from "../../config/db.js";

export const deleteBike = async (req, res) => {
  const { id } = req.params;
  let sql = "select * from bikesonrent where id = ? ";
  connection.query(sql, [id], (err, bike) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "error in DB ",
      });
    }
    if (bike.length < 1) {
      return res.status(404).json({
        success: false,
        message: "bike not found for these id",
      });
    }
    if (bike.length > 0) {
      connection.query(
        "delete from bikesonrent where id = ? ",
        [id],
        (err, result) => {
          if (err) {
            return res.send("error while deleting bike details");
          }
          if (result) {
            return res.status(200).json({
              success: true,
              message: "bike details remove succesfully",
            });
          }
        }
      );
    }
  });
};
