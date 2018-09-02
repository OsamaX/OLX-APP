const api = require("express").Router()
const Ads = require("../models/ads")
const User = require("../models/user")
const check = require("../middleware")

api.get("/ads/get/:page", check.requireLogIn, (req, res, next) => {
    let page = req.params.page
    let toSkip = page ? parseInt(page+"0") : 0

    Ads.find(search(req.query))
    .select("-__v -creator")
    .sort({_id: -1})
    .limit(10)
    .skip(toSkip)
    .exec()
    .then(doc => {
        let docs = []
        doc.forEach(d => {
            docs.push(d.toJSON({getters: true}))
        })
        res.send(docs)
    })
    .catch(err => console.log(err))
})

api.put("/profile/update", (req, res, next) => {
    User.findByIdAndUpdate(req.session.userId, {$set: req.body}, { new: true, runValidators: true }, (err, doc) => {
        if (err) {
            let errors = { error: true }

            const errorField = Object.keys(err.errors)
            errorField.forEach((field) => {
                errors[field] = err.errors[field].message
            })

            return res.send(errors)
        }

        if (doc) return res.send(doc.toJSON({getters: true}))
    })
})

api.delete("/ads/delete/:id", (req, res) => {
    Ads.findById({_id: req.params.id, creator: req.session.userId}, (err, ad) => {
        if (err) return next(err)
        
        if (ad) {
            ad.remove((err, ad) => {
                if (err) return next(err)

                res.send({success: true})
            })
        }
    })
})

api.get("/ads/details/:id", (req, res, next) => {
    Ads.findById(req.params.id)
    .populate({path: "creator", select: '-__v'})
    .exec()
    .then(doc => {
        if (doc) res.send(doc.toJSON({getters: true}))
    })
    .catch(err => next(err))
})

api.get("/ads/total", (req, res) => {
    Ads.countDocuments(search(req.query), (err, count) => {
        if (err) return next(err)

        res.send({count})
    })
})

function search(query) {
    let search = {}
    let {cat, t} = query
    
    if (cat && cat.trim().length > 0) {
        if (cat !== "all" && cat !== "''" && cat !== '""')  { search.category = cat }
    } 
    
    if (t && t.trim().length > 0) {
        if (t !== "''" && t !== '""') { search.title = new RegExp(t, "i") }
    }

    return search
}


module.exports = api