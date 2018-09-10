const express = require("express");
const path = require("path");
const User = require(".././models/user");
const Ads = require(".././models/ads");
const router = express.Router();
const check = require("../middleware")
const imgUpload = require("../middleware/imageUpload")

router.get("/firebase-messaging-sw.js", (req, res) => res.sendFile(path.join(__dirname, "../", "firebase-messaging-sw.js")))

router.get("/", check.loggedOut, (req, res) => res.sendFile(path.join(__dirname, "../html", "login.html")))

router.get("/sw.js", (req, res) => res.sendFile(path.join(__dirname, "../", "sw.js")))

router.get("/home", check.requireLogIn, (req, res) => res.sendFile(path.join(__dirname, "../html", "home.html")))

router.get("/register", check.loggedOut, (req, res) => res.sendFile(path.join(__dirname, "../html", "register.html")))

router.get("/message", check.requireLogIn, (req, res) => res.sendFile(path.join(__dirname, "../html", "messages.html")))

router.get("/myads", check.requireLogIn, (req, res) => res.sendFile(path.join(__dirname, "../html", "myads.html")))

router.get("/offline", check.requireLogIn, (req, res) => res.sendFile(path.join(__dirname, "../html", "offline.html")))

router.post("/push_notification", (req, res) => {
    const { uid } = req.body

    User.findById(uid)
        .select("user_token active")
        .exec((err, user) => {
            if (err) return next(err)
            console.log(user)
            if (user.user_token && user.active) {
                check.sendPushNotification(user.user_token, req.session.name, req.session.userId)
            }
        })
})

router.post("/", (req, res, next) => {
    const { email, password } = req.body
    User.authenticate(email, password, (err, user) => {
        if (err) {
            err.error = true
            return res.send(err)
        }

        if (user) {
            user.active = true
            user.save({ validateBeforeSave: false });
            req.session.userId = user._id
            req.session.name = user.name
            res.send(user.toJSON({ getters: true }))
        }
    })
})

router.post("/create", (req, res, next) => {
    console.log(req.body)
    if (!req.files) {
        return res.send({ error: true, images: "Upload atleast one image" })
    }

    let photos = req.files['photos[]']
    const ad = { ...req.body, creator: req.session.userId }

    imgUpload(photos)
        .then(images => {
            ad.images = images

            Ads.create(ad, (err, ad) => {
                if (err) {
                    let errors = { error: true }

                    const errorField = Object.keys(err.errors)
                    errorField.forEach((field) => {
                        errors[field] = err.errors[field].message
                    })

                    return res.send(errors)
                }

                res.send(ad.toJSON({ getters: true }))
            })
        })
        .catch(err => {

            res.send(err)
        })

})

router.post("/register", (req, res) => {
    let { last_name, ...user } = req.body
    user.name = `${user.name} ${last_name}`

    User.create(user, (err, user) => {
        if (err) {
            let errors = { error: true }

            const errorField = Object.keys(err.errors)
            errorField.forEach((field) => {
                errors[field] = err.errors[field].message
            })

            return res.send(errors)

        } if (user) {
            user.active = true
            user.save({ validateBeforeSave: false });
            req.session.userId = user._id
            req.session.name = user.name
            res.send(user.toJSON({ getters: true }))
        }
    })

})

router.get("/message/:uid", (req, res, next) => {
    console.log("what")
    let { uid } = req.params

    User.findOne({ _id: uid })
        .select("name phone messages")
        .exec((err, user) => {
            if (err) return next(err)

            if (user) {
                let loader = false
                user.messages.forEach(msg => {
                    if (msg.url.indexOf(`/message/${req.session.userId}`) > -1) {
                        loader = true
                    }
                })

                return res.render("message", { user: user.name, id: user.phone, loader })
            } else {
                return res.send({ error: "User not found" })
            }
        })

})

router.get("/user/message", (req, res) => {
    User.findById(req.session.userId).select("messages").exec((err, user) => {
        res.send(user)
    })
})

router.post("/user/message", (req, res, next) => {
    const { uid, adId } = req.body
    const saveId = req.session.userId

    saveToInbox(uid, saveId, adId).then(res => {
        if (res.success) {
            return saveToInbox(saveId, uid, adId)
        }
    }).then(response => {
        if (response.success) {
            return res.send({ success: true })
        }
    }).catch(err => console.log(err))

})

router.post("/save_token", (req, res) => {
    const token = req.body.token

    User.findByIdAndUpdate({ _id: req.session.userId }, { $set: { user_token: token } }, { new: true }, (err, user) => {
        if (err) return next(err)

        if (user) {
            return res.send({ token: user.user_token })
        }
    })
})

router.post("/logout", (req, res, next) => {
    if (req.session.userId) {
        User.findById(req.session.userId, function(error, user) {
            user.active = false
            user.save({ validateBeforeSave: false })

            req.session.destroy((err) => {
                if (err) return next(err)
    
                res.send({success: true})
            })
        })
    }
})

function saveToInbox(uid, saveId) {
    return new Promise((resolve, reject) => {
        let inbox = {}
        User.findById({ _id: uid }).select('name').exec()
            .then(user => {
                inbox.name = user.name
                inbox.url = `/message/${uid}`
                return User.findById(saveId).exec()
            })
            .then(user => {

                if (user) {
                    let exist = false
                    user.messages.forEach(msg => {
                        if (msg.url === inbox.url) {
                            exist = true
                        }
                    })

                    if (!exist) {
                        user.messages.unshift(inbox);
                        user.markModified('messages');
                        user.save({ validateBeforeSave: false });
                        resolve({ success: true })
                    }

                }
            })
            .catch(err => reject(err))
    })

}

module.exports = router