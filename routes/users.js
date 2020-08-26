/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const constants = require("../constants/constants");
const dbHelper = require("../helpers/dbHelper.js");

module.exports = (db) => {
  dbHelper.setDbConn(db);

  /**
  * Check if a user exists with a given username and password
  * @param {String} email
  * @param {String} password encrypted
  */
  const login = function (email, password) {
    return dbHelper.getUserWithEmail(email)
      .then(user => {
        if (bcrypt.compareSync(password, user.password)) {
          return user;
        }
        return null;
      });
  }
  router.post("/register", (req, res) => {
    const newUser = req.body;
    dbHelper.getUserWithEmail(newUser.email)
      .then(dbChkUser => {
        if (dbChkUser) {
          res.status(401).send({ error: "User already exist." });
          return;
        }
        newUser.password = bcrypt.hashSync(newUser.password, constants.saltRounds);
        dbHelper.addUser(newUser)
          .then(addedUser => {
            if (!addedUser) {
              res.status(401).send({ error: "Logon error occurd. could not create your account." });
              return;
            }

            req.session.userId = addedUser.id;
            const result = {
              username: addedUser.name,
              email: addedUser.email,
              phone: addedUser.phone
            };
            res.status(201).send(result);
          })
      })
      .catch(e => res.status(500).send({ error: e.message }));
  });

  /**
   * Expecting {email, password}
   */
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    login(email, password)
      .then(user => {
        if (!user) {
          res.status(401).send({ error: "Login failed." });
          return;
        }
        req.session.userId = user.id;
        const result = {
          username: user.name,
          email: user.email,
          phone: user.phone
        };
        res.status(200).send(result);
      })
      .catch(e => res.status(500).send({ error: e.message }));
  });

  router.post('/logout', (req, res) => {
    req.session.userId = null;
    res.status(200).send({});
  });

  return router;
};
