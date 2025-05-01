import connection from "../../config/db.js";

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, mobileNumber, email, bio, cityId } = req.body;

    let updatedFields = [];
    let values = [];

    if (firstName !== undefined) {
      updatedFields.push("firstName = ?");
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updatedFields.push("lastName = ?");
      values.push(lastName);
    }
    if (mobileNumber !== undefined) {
      updatedFields.push("mobileNumber = ? ");
      values.push(mobileNumber);
    }
    if (email !== undefined) {
      updatedFields.push("email = ?");
      values.push(email);
    }
    if (bio !== undefined) {
      updatedFields.push(bio);
      values.push(bio);
    }
    if (cityId !== undefined) {
      updatedFields.push(cityId);
      values.push(cityId);
    }

    if (updatedFields.length === 0) {
      return res.send("nothing to update");
    }

    let sql = `update users set ${updatedFields.join(", ")} where id = ? `;
    values.push(id);
    connection.query(sql, values, (err, user) => {
      if (err)
        return res.json({
          success: false,
          message: "error in db",
        });
      if (user.length < 1)
        return res.json({
          success: false,
          message: "No user Found For these ID",
        });

      res.status(201).json({
        success: true,
        message: "user details updaed succesfully",
        user,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in Update User API",
    });
  }
};
export const bikeUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { bikeRent, bikeName, cityId, manufecture, Manufecturing_Year } =
      req.body;

    let sqlo =
      "select bikeImage ,isAdminApproved from bikesonrent where id = ? ";
    connection.query(sqlo, id, (err, bike) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error in DB " + err.message,
        });
      }
      if (bike.length < 1) {
        return res.status(404).json({
          success: false,
          message: "bike not found for these id",
        });
      }

      if (bike.length > 0 && bike[0].isAdminApproved == "1") {
        return res.send("Approved by Admin Cant update details");
      }

      // console.log(req.files[0].bikeImage);
      let bikeImage =
        req.files && req.files.length > 0
          ? req.files[0].filename
          : bike[0].bikeImage;

      let updatedfields = [];
      let values = [];

      if (bikeRent !== undefined) {
        updatedfields.push("bikeRent = ? ");
        values.push(bikeRent);
      }
      if (bikeName !== undefined) {
        updatedfields.push("bikeName = ? ");
        values.push(bikeName);
      }
      if (cityId !== undefined) {
        updatedfields.push("cityId = ? ");
        values.push(cityId);
      }
      if (bikeImage !== undefined) {
        updatedfields.push("bikeImage = ? ");
        values.push(bikeImage);
      }
      if (manufecture !== undefined) {
        updatedfields.push("manufecture = ? ");
        values.push(manufecture);
      }
      if (Manufecturing_Year !== undefined) {
        updatedfields.push("Manufecturing_Year = ?");
        values.push(Manufecturing_Year);
      }
      let sql = `update bikesonrent SET ${updatedfields.join(
        " , "
      )} where id = ?`;
      values.push(id);
      connection.query(sql, values, (err, bike) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "error in DB " + err.message,
          });
        }
        if (bike.length < 1) {
          return res.json({
            success: false,
            message: "No data found for these id",
          });
        }
        res.status(201).send({
          success: true,
          message: "Bike updated successfully",
          bike,
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in bike Update API",
    });
  }
};
