const express = require("express");
const path = require("path");
const User = require(".././models/user");
const Ads = require(".././models/ads");
const router = express.Router();
const check = require("../middleware")
const imgUpload = require("../middleware/imageUpload")

router.get("/firebase-messaging-sw.js", (req, res) => res.sendFile(path.join(__dirname, "../", "firebase-messaging-sw.js")))

router.get("/", check.loggedOut, (req, res) => res.sendFile(path.join(__dirname, "../html", "login.html")))

router.get("/home", check.requireLogIn, (req, res) => res.sendFile(path.join(__dirname, "../html", "home.html")))

router.get("/register", check.loggedOut, (req, res) => res.sendFile(path.join(__dirname, "../html", "register.html")))

router.get("/message", (req, res) => res.sendFile(path.join(__dirname, "../html", "messages.html")))

router.post("/", (req, res, next) => {
    const { email, password } = req.body
    User.authenticate(email, password, (err, user) => {
        if (err) {
            err.error = true
            return res.send(err)
        }

        if (user) {
            req.session.userId = user._id
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

            res.send(errors)

        } else {
            req.session.userId = user._id
            res.send(user.toJSON({ getters: true }))
        }
    })

})

router.get("/message/:uid/:adId", (req, res, next) => {
    let {uid, adId} = req.params
    console.log(`/message/${uid}/${adId}`)
    User.findOne({ _id: uid })
        .select("name phone messages")
        .exec((err, user) => {
            if (err) return next(err)

            if (user) {
                let loader = false
                user.messages.forEach(msg => {
                    if (msg.url.indexOf(`/message/${req.session.userId}/${adId}`) > -1) {
                        loader = true
                    }
                })
                console.log(user.name)
                return res.render("message", { user: user.name, id: user.phone, adId: adId, loader })
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
            return res.send({success: true})
        }
    }).catch(err => console.log(err))

})

router.post("/logout", (req, res, next) => {
    if (req.session.userId) {
        req.session.destroy((err) => {
            if (err) return next(err)
            res.send({ success: true })
        })
    }
})

function saveToInbox(uid, saveId, adId) {
    return new Promise((resolve, reject) => {
        let inbox = {}

        User.findById({ _id: uid }).select('name').exec()
            .then(user => {
                inbox.name = user.name
                return Ads.findById({ _id: adId }).select('title').exec()
            })
            .then(ads => {

                inbox.title = ads.title
                inbox.url = `/message/${uid}/${adId}`
                User.findById(saveId, (err, user) => {
                    if (err) {
                        return reject(err)
                    }

                    if (user) {
                        let exist = false
                        user.messages.forEach(msg => {
                            if (msg.url === inbox.url) { 
                                exist = true 
                            } 
                        })
                        
                        if (!exist) {
                            user.messages.push(inbox);
                            user.markModified('messages');
                            user.save({ validateBeforeSave: false });
                            resolve({success: true})
                        }

                    }
                })
            })
            .catch(err => reject(err))
    })

}

module.exports = router