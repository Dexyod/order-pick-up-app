const { resolveInclude } = require("ejs");
const utils = require("./utils");

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
  const sql = `SELECT id, name, email, password, phone
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
  const sql = `INSERT INTO users (name, email, password, phone)
  VALUES ($1, $2, $3, $4) RETURNING *`;
  return dbConn.query(sql, [user.username, user.email, user.password, user.phone])
    .then(res => res.rows[0]);
};

const getAllItems = () => {
  const sql = `SELECT id, name, description, category, price, photo_url
  FROM items;`;

  return dbConn.query(sql)
    .then(res => res.rows);
};

const setOrderCompleted = (order_id) => {
  const sql = `UPDATE orders
  SET end_time = now()
  WHERE id = $1;`;

  dbConn.query(sql, [order_id]);
};

/**
 * Get order history for the current logged on user
 * @param  userId This userd id of the loged on user
 * @param limit. how may records to return. default to 4
 */
const getUserHistory = (userId, limit = 4) => {
  const sql = `SELECT items.id, items.name, order_details.quantity, items.description, items.category, items.price, items.photo_url, orders.order_date
  FROM items
  JOIN order_details ON order_details.item_id = items.id
  JOIN orders ON orders.id = order_details.order_id
  JOIN users ON users.id = orders.user_id
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
 * Get active order cart header by specific order id
 * @param  orderId This userd id of the loged on user
 * this method will be called by getUserCart below
 */
const getOrderHeaderByOrderId = (orderId) => {
  const sql = `SELECT id, phone, comment, order_date, start_time
  FROM orders
  WHERE id = $1
  AND end_time IS NULL;`;

  return dbConn.query(sql, [orderId])
    .then(res => res.rows[0]);
};

/**
 * Get cart detail for the logged on user
 * @param  order_id Order id from the cart header
 * this method will be called by getUserCart below.
*/
const getOrderDetails = (order_id) => {
  const sql = `SELECT order_details.quantity, items.name, order_details.description,
  order_details.price, items.photo_url
  FROM order_details
  JOIN items ON items.id = order_details.item_id
  WHERE order_id = $1;`;

  return dbConn.query(sql, [order_id])
    .then(res => res.rows);
};

/**
 * Create new order for this user.
 * @param {*} items [{id, description, quantity, price, comment}]
 * @param {*} userId
 */
const createNewOrder = (items, userId, orderComment) => {

  const sql1 = `INSERT INTO orders (user_id, phone, comment, order_date, start_time, end_time)
       SELECT $1, users.phone, $3, now()::date, now(), NULL
       FROM users WHERE users.id = $2 RETURNING id;`;

  const sql2 = `INSERT INTO order_details (order_id, item_id, description, quantity, price)
          VALUES ($1, $2, $3, $4, $5);`;

  return new Promise((resolve, reject) => {
    //this code taken from https://node-postgres.com/features/transactions
    dbConn.query('BEGIN')
      .then(() => {
        dbConn.query(sql1, [userId, userId])
          .then(res => {
            const order_id = res.rows[0].id;
            for (item of items) {
              const sqlParams = [order_id, item.id, item.description, item.quantity, item.price];
              dbConn.query(sql2, sqlParams)
                .then(() => {

                });
              continue;
            }
            dbConn.query('COMMIT')
              .then(() => { resolve(order_id); });
          });
      })
      .catch(e => {
        dbConn.query('ROLLBACK')
          .then(() => {
            reject(e.message);
          });
      });
  });
};

/**
 * Create new cart for this user.
 * @param {{}} item [{id,description, quantity, price}]
 * @param {*} userId
 */
const createNewCart = (item, userId) => {

  const sql1 = `INSERT INTO orders (user_id, phone, comment, order_date, start_time, end_time)
      SELECT $1, users.phone, '', now()::date, now(), NULL
      FROM users WHERE users.id = $2 RETURNING id;`;

  const sql2 = `INSERT INTO order_details (order_id, item_id, description, quantity, price)
          SELECT $1, $2, items.description, $3, items.price
          FROM items WHERE items.id = $4;`

  return new Promise((resolve, reject) => {
    //this code taken from https://node-postgres.com/features/transactions
    dbConn.query('BEGIN')
      .then(() => {
        dbConn.query(sql1, [userId, userId])
          .then(res => {
            const sqlParams = [res.rows[0].id, item.id, item.quantity, item.id];
            dbConn.query(sql2, sqlParams)
              .then(() => {
                dbConn.query('COMMIT')
                  .then(() => { resolve(true); });
              });
          });
      })
      .catch(e => {
        dbConn.query('ROLLBACK')
          .then(() => {
            reject(e.message);
          });
      });
  });
};

/**
 * Update and existing cart.
 * @param {*} item
 * @param {*} userId
 */
const addItemToCart = (item, userId) => {

  //this is assuming that there are only ever on open cart for this user. this should always be correct unless something went wrong.
  const sql = `INSERT INTO order_details (order_id, item_id, quantity, description, price)
  SELECT $1, $2, $3, items.description, items.price
  FROM items WHERE items.id = $4 RETURNING *;`

  //get order id of open cart.
  return getOrderHeaderByUserId(userId)
    .then(header => {
      const sqlParams = [header.id, item.id, item.quantity, item.id];
      dbConn.query(sql, sqlParams)
        .then(res => res.rows);
    });
  //.catch(e => {throw e;});
}
/**
 * Get the current cart information of the logged on user
 * @param  userId This userd id of the loged on user
 * this method will return an empty object {} if no cart is present.
 */
const getUserCart = (userId) => {

  return new Promise((resolve, reject) => {
    getOrderHeaderByUserId(userId)
      .then(header => {
        if (!header) {
          resolve({});
        }
        getOrderDetails(header.id)
          .then(details => {
            if (!details) {
              resolve({})
            }
            //console.log("returning header, details");//, header, details);
            resolve({ header, details });
          });
      });
  });
};

/**
 * get user cart by the order id of the cart.
 * @param {*} orderId
 */
const getUserCartByOrderId = (orderId) => {

  return new Promise((resolve, reject) => {
    getOrderHeaderByOrderId(orderId)
      .then(header => {
        if (!header) {
          resolve({});
        }
        getOrderDetails(header.id)
          .then(details => {
            if (!details) {
              resolve({})
            }
            //console.log("returning header, details", header, details);
            resolve({header, details });
          });
      });
  });
};

/**
 * This method adds a single item to the cart or a create a new cart with  single item.
 * @param {*} item
 * @param {*} userId
 */
const addToCart = (item, userId) => {

  return new Promise((resolve, reject) => {
    //first check for an open cart. if none, create one.
    return getOrderHeaderByUserId(userId)
      .then(header => {
        if (!header) {
          createNewCart(item, userId)
            .then(() => {
              getUserCart(userId)
                .then(cartData => {
                  resolve(cartData);
                });
            });
        } else {
          addItemToCart(item, userId)
            .then(() => {
              getUserCart(userId)
                .then(cartData => {
                  resolve(cartData);
                });
            });
        }
      });
  });
};

/**
 * This method create a new cart with all items from front page.
 * @param {*} items
 * @param {*} userId
 *
 * Expecting items array.
 */
const createOrder = (items, userId, orderComment) => {

  return new Promise((resolve, reject) => {
    createNewOrder(items, userId, orderComment)
      .then(result => {
        getUserCartByOrderId(result)
          .then(cartData => {
            resolve(cartData);
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
  getUserCart,
  addToCart,
  createOrder,
  setOrderCompleted
}
