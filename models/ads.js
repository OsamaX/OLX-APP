const mongoose = require("mongoose"), path = require("path")

const adSchema = new mongoose.Schema({
    title: { type: String, trim: true, required: [true, "Title can't be blank"] },
    category: { type: String, trim: true, required: [true, "Select a Category"] },
    description: { type: String, trim: true, required: [true, "Description can't be blank"] },
    images: { type: [String], required: [true, "Upload atleast one photo"], get: (img) => {

        let images = []
        img.forEach(img => {
            let loc = img.slice(img.indexOf("images"))
            let newPath = path.join("static", loc)

            images.push(newPath)
        })
        return images
    }},
    price: { type: Number, required: [true, "Price required"],  min: [0, "Price can't be 0"]},
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, {
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v
            delete ret.id
        }
    }
})

const Ad = mongoose.model("Ad", adSchema)

module.exports = Ad