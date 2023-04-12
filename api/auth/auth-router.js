const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { JWT_SECRET } = require("../secrets"); // use this secret!
const bcrypt = require('bcryptjs')
const User = require('../users/users-model')


router.post("/register", validateRoleName, (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */

    const { username, password } = req.body
    const { role_name } = req
    const hash = bcrypt.hashSync(password, 8)
    User.add({ username, password: hash, role_name }) //<< must make sure the password is hashed like this
      .then(newlyCreatedUser => {
        res.status(201).json({
          user_id: newlyCreatedUser.user_id,
          username: newlyCreatedUser.username,
          role_name: newlyCreatedUser.role_name,
        }) // this was sending back the bcrypted password also, this little bit of synctax is just making it so only these things come back
      })
      .catch(next) 
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
});

module.exports = router;
