

const authenticate2 = (req, res, next) => {
    if (req.session.user) {
        res.locals.isAuthenticated = true;
        res.locals.user = req.session.user;
    } else {
        res.locals.isAuthenticated = false;
        res.locals.user = null;
    }
    next();
};

module.exports = authenticate2;
