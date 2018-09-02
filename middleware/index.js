const requireLogIn = (req, res, next) => {
    if (req.session && req.session.userId) {
        next()
    } else {
        res.redirect("/")
    }
}

const loggedOut = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/home")
    } else {
        next()
    }
}

module.exports.requireLogIn = requireLogIn
module.exports.loggedOut = loggedOut
