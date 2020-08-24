/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');
const dbHelper = require("../helpers/dbHelper.js");

module.exports = (db) => {
  dbHelper.setDbConn(db);

   /**
   * Check if a user exists with a given username and password
   * @param {String} email
   * @param {String} password encrypted
   */
  const login =  function(email, password) {
    return dbHelper.getUserWithEmail(email)
    .then(user => {
      if (bcrypt.compareSync(password, user.password)) {
        return user;
      }
      return null;
    });
  }

  /*router.get("/", (req, res) => {
    db.query(`SELECT * items;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });*/
  //Create new user??
  /**
   * Expecting user object
   * {customerName, email, phone, password}
   */
  router.post("/", (req, res) => {
    const newUser = req.body;
    console.log("new user");
    console.log(newUser);
    dbHelper.getUserWithEmail(newUser.email)
    .then(dbChkUser => {
      if (dbChkUser) {
        console.log("user already exist");
        console.log(dbChkUser);
        res.send({error: "User already exist."});
        return;
      }
      newUser.password = bcrypt.hashSync(newUser.password, 12);
      dbHelper.addUser(newUser)
      .then(addedUser => {
        if (!addedUser) {
          console.log("user not added");
          res.send({error: "Logon error occurd. could not create your account."});
          return;
        }
        console.log("user added.");
        console.log(addedUser);
        req.session.userId = addedUser.id;
        res.send("OK");
      })
    })
    .catch(e => res.send(e));
  });

  /**
   * Expecting {email, password}
   */
  router.post('/login', (req, res) => {
    const {email, password} = req.body;
    login(email, password)
      .then(user => {
        if (!user) {
          res.send({error: "error"});
          return;
        }
        req.session.userId = user.id;
        //res.send({user: {name: user.name, email: user.email, id: user.id}});
        res.redirect("/");
      })
      .catch(e => res.send(e));
  });

  router.post('/logout', (req, res) => {
    req.session.userId = null;
    res.send({});
  });

  return router;
};
