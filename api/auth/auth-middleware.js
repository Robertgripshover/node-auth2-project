const { JWT_SECRET } = require("../secrets"); // use this secret!

const jwt = require('jsonwebtoken')

const { findBy } = require('../users/users-model')


const restricted = (req, res, next) => {
  /*
    If the user does not provide a token in the Authorization header:
    status 401
    {
      "message": "Token required"
    }

    If the provided token does not verify:
    status 401
    {
      "message": "Token invalid"
    }

    Put the decoded token in the req object, to make life easier for middlewares downstream!
  */
    const token = req.headers.authorization //<< this is where you can find the token
    if (!token) {
      return next({ status: 401, message: 'Token required' })
    }
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err) {
        next({ status: 401, message: 'Token invalid' }) //<< this path means the token is bad for some reason
      } else {
        req.decodedToken = decodedToken //<< tacking the decoded token onto the req object, this containts the decoded info about the user
        next()
      }
    }) //<< this verify function takes 3 arguments
    //it takes the token you are verifying, the secret you used to sign the token 
    //and a callback that handles it
}

const only = role_name => (req, res, next) => {
  /*
    If the user does not provide a token in the Authorization header with a role_name
    inside its payload matching the role_name passed to this function as its argument:
    status 403
    {
      "message": "This is not for you"
    }

    Pull the decoded token from the req object, to avoid verifying it again!
  */
    const { role_name } = req.decodedToken
}


const checkUsernameExists = async (req, res, next) => {
  /*
    If the username in req.body does NOT exist in the database
    status 401
    {
      "message": "Invalid credentials"
    }
  */
    try {
      const [user] = await findBy({ user: req.body.username })
      if (!user) {
        next({ status: 422, message: "Invalid credentials" })
      } else {
        req.user = user //<< this way we already have the password on the req object when the time comes to compare it
        next()
      }
    } catch (err) {
      next(err)
    } 
}


const validateRoleName = (req, res, next) => {
  /*
    If the role_name in the body is valid, set req.role_name to be the trimmed string and proceed.

    If role_name is missing from req.body, or if after trimming it is just an empty string,
    set req.role_name to be 'student' and allow the request to proceed.

    If role_name is 'admin' after trimming the string:
    status 422
    {
      "message": "Role name can not be admin"
    }

    If role_name is over 32 characters after trimming the string:
    status 422
    {
      "message": "Role name can not be longer than 32 chars"
    }
  */
    if (!req.body.role_name || !req.body.role_name.trim()) { //if both of these are falsy then...
      req.role_name = 'student'
      next()
    } //<< this is just saying if no role is specified then make it a 'student' role
    else if (req.body.role_name.trim() === 'admin') {
      next({ status: 422, message: 'Role name cannot be admin' }) //this is because you can't just create a role of 'admin'
    }
    else if (req.body.role_name.trim().length > 32) {
      next({ status: 422, message: 'Role name can not be longer than 32 chars' }) //
    } else {
      req.role_name = req.body.role_name.trim()
      next() //so if all of these things pass, next() will just be called and this middleware has done its job
    }
}

module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only,
}
