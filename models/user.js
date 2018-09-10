const mongoose = require("mongoose")
const mongooseTypes = require("mongoose-types")
const bcrypt = require("bcrypt-nodejs")

mongooseTypes.loadTypes(mongoose, "email")
const Email = mongoose.SchemaTypes.Email
const SALT_FACTOR = 10

const custom = [function (email) {
    return new Promise((resolve, reject) => {
        User.countDocuments({ email }, (err, is) => {
            if (err) return console.log(err)
            resolve(is === 0)
        })
    })
}, "Email already in use"]

const UpperName = (name) => {
    let n = name.split(" ")
    return n[0].charAt(0).toUpperCase() + n[0].slice(1) + " " + n[1].charAt(0).toUpperCase() + n[1].slice(1)
}

const userSchema = mongoose.Schema({
    name: { type: String, required: [true, "Name can't be blank"], trim: true, lowercase: true, get: UpperName },

    password: { type: String, required: [true, "Password can't be blank"], minlength: [6, "Password should be at least 6 characters"] },
    email: { type: Email, required: [true, "Invalid Email"], trim: true, lowercase: true, validate:  custom },
    phone: { type: String, required: [true, "Phone Number required"], minlength: [11, "Invalid Phone Number"], maxlength: [11, "Invalid Phone Number"], set: phone => phone.toString() },
    city: { type: String, required: [true, "City can't be blank"], default: " ", trim: true },
    province: { type: String, required: [true, "Province can't be blank"], default: " ", trim: true },
    messages: { type: [mongoose.Schema.Types.Mixed] },
    user_token: String,
    active: Boolean
}, {
      toJSON: {
        transform: function (doc, ret) {
          delete ret.id
          delete ret.__v
          delete ret.password
        }
      }
})


let noop = function () { }

userSchema.pre("save", function (done) {
    const user = this

    if (!user.isModified("password")) {
        return done()
    } else {
        bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
            if (err) { return done(err) }
            bcrypt.hash(user.password, salt, noop, function (err, hash) {
                if (err) { return done(err) }
                user.password = hash
                done()
            })
        })
    }
})

userSchema.statics.authenticate = function (email, password, done) {
    User.findOne({email}, function(err, user) {
        if (err) return done(err)

        if (!user) {
            return done({field: "email", message: "Invalid Email Address"})
        }

        bcrypt.compare(password, user.password, function (err, isMatch) {

            if (!isMatch) {
                return done({field: "password", message: "Incorrect Password"})
            }

            done(err, user)
        })

    })
}

userSchema.methods.getName = function () { 
    return this.name.splice(" ")[0]
}

const User = mongoose.model("User", userSchema)
module.exports = User