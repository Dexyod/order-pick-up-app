/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
const {
  messageCustomer,
  messageRestaurant,
  orderComplete,
  failedMessage
} = require('../public/scripts/twilio');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const constants = require("../constants/constants");
const dbHelper = require("../helpers/dbHelper.js");


module.exports = (db) => {
  dbHelper.setDbConn(db);

  router.get("/", (req, res) => {
    dbHelper.getAllItems()
      .then(data => res.status(201).send(data))
      .catch(error => res.status(201).send(error));
  });

  router.get("/user-cart", (req, res) => {
    if (!req.session.userid) {
      res.status(201).send({ error: "You are not logged on. Please log on or crate an account." });
      return;
    }
    dbHelper.getUserCart(req.session.userId)
      .then(data => {
        res.status(201).send(data)
      })
      .catch(e => res.status(201).send({ error: e.message }));
  });

  router.get("/user-history", (req, res) => {
    if (!req.session.userid) {
      res.status(201).send({ error: "You are not logged on. Please log on or crate an account." });
      return;
    }
    dbHelper.getUserHistory(req.session.userId)
      .then(data => res.status(201).send(data))
      .catch(e => res.status(201).send({ error: e.message }));
  });

  router.post("/sms", (req, res) => {
    const params = req.body.Body.split(' ');
    // console.log(params);
    // console.log(req.body)
    if (params[0] === 'ETA') {
      messageCustomer(params[1], params[2], params[3], params[4]);
    } else if (params[0] === 'Complete') {
      orderComplete(params[1], params[2], params[3]);
    } else {
      failedMessage();
    }
  });

  /**
   * Add item to cart.
   * expecting item object in req.body
   * items array [{id, description, quantity, price, comment}]
   */
  router.post("/", (req, res) => {
    if (!req.session.userid) {
      res.status(201).send({ error: "You are not logged on. Please log on or crate an account." });
      return;
    }
    const items = JSON.parse(req.body.items);
    dbHelper.createOrder(items, req.session.userid)
      .then(data => res.status(201).send(data))
      .catch(e => res.status(201).send({ error: e.message }));
  });

  return router;
};
