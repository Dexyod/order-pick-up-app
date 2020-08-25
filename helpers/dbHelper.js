const { resolveInclude } = require("ejs");

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
<<<<<<< HEAD
  return dbConn.query(sql, [user.username, user.email, user.password, user.phone]);
=======

  return dbConn.query(sql, [user.customerName, user.email, user.password, user.phone]);
>>>>>>> 26a9eed5e83436744bdf1494247ca66f250cb439
};

const getAllItems = (limit= 6) => {
  const sql = `SELECT id, name, description, price, photo_url
  FROM items
  LIMIT $1;`;

  return dbConn.query(sql, [limit])
  .then(res => res.rows);
};

/**
 * Get order history for the current logged on user
 * @param  userId This userd id of the loged on user
 * @param limit. how may records to return. default to 4
 */
const getUserHistory = (userId, limit = 4) => {
  const sql = `SELECT order_details.quantity, items.name, order_details.description,
  order_details.price, items.photo_url
  FROM order_details
  JOIN orders ON orders.id = order_details.order_id
  JOIN users ON users.id = orders.user_id
  JOIN items ON items.id = order_details.item_id
  WHERE users.id = $1
  AND orders.end_time IS NOT NULL
  ORDER BY orders.order_date
  LIMIT $2;`;

  return dbConn.query(sql, [userId, limit])
  .then(res => res.rows);
};

/**
 * Get order current cart header of the logged on user
 * @param  userId This userd id of the loged on user
 * this method will be called by getUserCart below
 */
const getOrderHeaderByUserId = (userId) => {
  const sql = `SELECT id, phone, comment, order_date, start_time
  FROM orders
  WHERE user_id = $1
  AND end_time IS NULL;`;

  return dbConn.query(sql, [userId])
  .then(res => res.rows[0]);
};
/**
 * Get cart detail for the logged on user
 * @param  order_id Order id from the cart header
 * this method will be called by getUserCart below.
*/
const getOrderDetails = (order_id) => {
  const sql = `SELECT order_details.line_no, order_details.quantity, items.name, order_details.description,
  order_details.price, items.photo_url, order_details.comment
  FROM order_details
  JOIN items ON items.id = order_details.item_id
  WHERE order_id = $1;`;

  return dbConn.query(sql, [order_id])
  .then(res => res.rows);
};

/**
 * Get the current cart information of the logged on user
 * @param  userId This userd id of the loged on user
 * this method will return an empty object {} if no cart is present.
 */
const getUserCart = (userId) => {
  return new Promise((resolve, reject) => {
    getOrderHeaderByUserId(userId)
    .then(header => {
      if(!header) {
        resolve({});
      }
      getOrderDetails(header.id)
      .then(details => {
        if (!details) {
          resolve({})
        }
        resolve({header, details});
      });
    });
  });
};

module.exports = {
  getUserWithEmail,
  setDbConn,
  addUser,
  getAllItems,
  getUserHistory,
  getOrderHeaderByUserId,
  getOrderDetails,
  getUserCart
}
