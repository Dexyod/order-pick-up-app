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
      .then(data => res.send(data))
      .catch(error => res.send(error));
  });

  router.get("/user-cart", (req, res) => {
    console.log("/user-cart", req.session.userId);
    if (!req.session.userId) {
      res.redirect("/");
      return;
    }
    dbHelper.getUserCart(req.session.userId)
      .then(data => {
        console.log(data);
        //messageRestaurant should go here
        res.send(data);
      })
      .catch(error => res.send(error));
  });

  router.get("/user-history", (req, res) => {
    console.log("/user-history", req.session.userId);
    if (!req.session.userId) {
      res.redirect("/");
      return;
    }
    dbHelper.getUserHistory(req.session.userId)
      .then(data => res.send(data))
      .catch(error => res.send(error));
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

  return router;
};
