let dbConn;

/**
 * Sets the current database connection object.
 * @param {object} conn the current database connection.
*/
const setDbConn = conn => {
  dbConn = conn;
};

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = email => {
  const sql = `SELECT id, name, email, password
  FROM users
  WHERE email = $1;`;
  return dbConn.query(sql, [email]).then(res => res.rows[0]);
};

/**
 * Add a new user to the users table
 * @param {{}} user object containing submitted form data.
 * {customerName, email, phone, password}.
 * Password is already hashed.
 */
const addUser = (user) => {
  sql = `INSERT INTO users (name, email, password, phone)
  VALUES ($1, $2, $3, $4) RETURNING *`;
  return dbConn.query(sql, [user.username, user.email, user.password, user.phone]);
};

module.exports = {
  getUserWithEmail,
  setDbConn,
  addUser
}
