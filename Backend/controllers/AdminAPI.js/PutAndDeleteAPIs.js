import connection from "../../config/db.js";

export const deleteCity = (req, res) => {
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
};

export const deleteInsurance = (req, res) => {
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
};

// Update APIs

export const updateInsurance = (req, res) => {
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
};

export const updateCity = (req, res) => {
  const { id } = req.params;

  connection.query("SELECT * FROM city WHERE id = ?", [id], (err, results) => {
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
  });
};
