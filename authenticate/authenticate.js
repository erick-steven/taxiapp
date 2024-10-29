      
     // authenticate/authenticate.js
      
      
      
      const authenticate = (req, res, next) => {
    if (req.session.customer) {
        next();
    } else {
        res.redirect('/auth/login');
    }
  };
  
  module.exports = authenticate;
  