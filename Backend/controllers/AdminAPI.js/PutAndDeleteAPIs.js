import connection from "../../config/db.js";

export const deleteCity = (req, res) => {
  try {
    const { id } = req.params;

    const check = connection.query(
      "SELECT * FROM city WHERE id = ?",
      [id],
      (err, result) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "Error in DB DELETE CITY" + err.message,
          });

        if (result.length === 0)
          return res.status(404).json({
            success: false,
            message: "City Not Found",
          });
      }
    );
    connection.query("DELETE FROM city WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "City deleted" });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in DELETE CITY API",
    });
  }
};

export const deleteInsurance = (req, res) => {
  try {
    const id = req.params.id;
    connection.query(
      `DELETE FROM Insurance WHERE id = ?`,
      [id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Insurance not found" });
        res.status(200).json({ message: "Insurance deleted successfully" });
      }
    );
  } catch (error) {
    return res.status({
      success: false,
      message: "ERROR IN Delete Insurance",
    });
  }
};

// Update APIs

export const updateInsurance = (req, res) => {
  try {
    const id = req.params.id;
    const { insuranceAmount, accidentPayoutAmount } = req.body;

    // Build dynamic update fields
    let updateFields = [];
    let values = [];

    if (insuranceAmount !== undefined) {
      updateFields.push("insuranceAmount = ?");
      values.push(insuranceAmount);
    }

    if (accidentPayoutAmount !== undefined) {
      updateFields.push("accidentPayoutAmount = ?");
      values.push(accidentPayoutAmount);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    const sql = `UPDATE Insurance SET ${updateFields.join(", ")} WHERE id = ?`;
    values.push(id);

    connection.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Insurance not found" });
      res.status(200).json({ message: "Insurance updated successfully" });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in Update Insurence APIs",
    });
  }
};

export const updateCity = (req, res) => {
  try {
    const { id } = req.params;

    connection.query(
      "SELECT * FROM city WHERE id = ?",
      [id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0)
          return res.status(404).send({ message: "City not found" });

        const existingCity = results[0];

        const body = req.body || {};

        const cityName =
          body.cityName === undefined ? existingCity.cityName : body.cityName;

        const cityImage = req.file
          ? `/uploads/${req.file.filename}`
          : existingCity.cityImage;

        const sql = "UPDATE city SET cityName = ?, cityImage = ? WHERE id = ?";
        connection.query(sql, [cityName, cityImage, id], (err, result) => {
          if (err) return res.status(500).send(err);
          res.send({ message: "City updated" });
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while updating CITY DETAILS" + error.message,
    });
  }
};

export const verifyPendingBikes = async (req, res) => {
  try {
    connection.query(
      "update bikesonrent set isAdminApproved = '1' where id = ? ",
      [req.params.id],
      (err, result) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "DB error in verifyPendingBikes" + err.message,
          });
        res.status(200).json({
          success: true,
          message: `bike verify succesfully`,
          result,
        });
      }
    );
  } catch (err) {
    res.send("error in verifyPendingBikes" + err.message);
  }
};

export const AdminVerifyUser = async (req, res) => {
  try {
    connection.query(
      "update users set Admin_approved = '1' where id = ? ",
      [req.params.id],
      (err, result) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "DB Error  in Verify User API" + err.message,
          });

        if (result.length < 1)
          return res.json({
            success: false,
            message: "user not found for these id",
          });

        res.status(200).json({
          success: true,
          message: "user Approved Successfully",
          result,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in verify User API",
    });
  }
};

export const AdminVerifyRider = async (req, res) => {
  try {
    connection.query(
      "update riders set isAdminVerified = '1' , verification_status = ? where id = ? ",
      [req.body.verification_status, req.params.id],
      (err, rider) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "DB Error in AdminVerifyRider API" + err.message,
          });
        if (rider.length < 1)
          return res.json({
            success: false,
            message: "Rider not found",
          });
        res.json({
          success: true,
          message: "Rider Approved Succesfully",
          rider,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: true,
      message: "Error in verify Rider API",
    });
  }
};

export const AdminVerifyClaim = async (req, res) => {
  try {
    const { Admin_Approval } = req.body;

    if (Admin_Approval != "1") {
      if (Admin_Approval != "2")
        return res.status(500).json({
          success: false,
          message: "Invalid verify Type",
        });
    }

    let sql = "update claims set Admin_Approval= ? where id = ?";
    connection.query(sql, [Admin_Approval, req.params.id], (err, result) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "DB ERROR While updatong AdminApproval" + err.message,
        });
      res.status(200).json({
        success: true,
        message: "Verification Done",
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in ADMIN Verify CLAIM API" + error.message,
    });
  }
};
