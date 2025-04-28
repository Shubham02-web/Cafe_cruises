import connection from "../config/db.js";

export function createUser(user, callback) {
  const sql = `
    INSERT INTO users 
    (firstName, lastName, mobileNumber, email, password, otp , role , bio)
    VALUES (?, ?, ?, ?, ?, ?,?,?)`;

  const values = [
    user.firstName,
    user.lastName,
    user.mobileNumber,
    user.email,
    user.password,
    user.otp,
    user.role,
    user.bio,
  ];

  connection.query(sql, values, callback);
}

export function verifyOtp(mobileNumber, otp, callback) {
  const checkSql = `SELECT * FROM users WHERE mobileNumber = ? AND otp = ?`;
  connection.query(checkSql, [mobileNumber, otp], (err, results) => {
    if (err) return callback(err);

    if (results.length === 0) {
      return callback(null, false);
    }

    const updateSql = `UPDATE users SET isVerified = 1 WHERE mobileNumber = ?`;
    connection.query(updateSql, [mobileNumber], (updateErr, updateResult) => {
      if (updateErr) return callback(updateErr);
      return callback(null, true);
    });
  });
}

export function findUserByMobile(mobileNumber, callback) {
  const sql = `SELECT * FROM users WHERE mobileNumber = ?`;
  connection.query(sql, [mobileNumber], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null);
    return callback(null, results[0]);
  });
}

export function updateOtpByMobile(mobileNumber, otp, callback) {
  const sql = `UPDATE users SET otp = ? WHERE mobileNumber = ?`;
  connection.query(sql, [otp, mobileNumber], callback);
}

export function updatePasswordByMobile(mobileNumber, hashedPassword, callback) {
  const sql = `
        UPDATE users SET password = ? WHERE mobileNumber = ?`;
  connection.query(sql, [hashedPassword, mobileNumber], callback);
}

export function resendOtpByMobile(mobileNumber, otp, callback) {
  const sql = `UPDATE users SET otp = ? WHERE mobileNumber = ?`;
  connection.query(sql, [otp, mobileNumber], callback);
}

export function verifyUserOtp(mobileNumber, callback) {
  const sql = `UPDATE users SET isVerified = 1 WHERE mobileNumber = ?`;
  connection.query(sql, [mobileNumber], callback);
}
