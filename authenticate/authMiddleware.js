// middlewares/authMiddleware.js
module.exports = (req, res, next) => {
    if (req.session && req.session.admin) {
      return next();
    } else {
      res.redirect('/admin/auth'); // Redirect to the login/registration page if not authenticated
    }
  };
  