const express = require("express")
const path = require("path")
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const admin = require('firebase-admin')
const serviceAccount = require("./olx-pakistan-cb51c-firebase-adminsdk-wyih8-6bf8f870e5.json")
const routes = require("./routes/router")
const Rest_API = require("./rest_api/")
const fileUpload = require('express-fileupload');

const app = express()

app.set("db_user", process.env.DB_USER || "osamaavvan")
app.set("db_pass", process.env.DB_PASS || "DB796096")

mongoose.connect("mongodb://localhost:27017/olx", { useNewUrlParser: true })
// mongoose.connect(`mongodb://${app.get("db_user")}:${app.get("db_pass")}@ds141902.mlab.com:41902/olx`, { useNewUrlParser: true })
const db = mongoose.connection

db.on("error", console.error.bind(console, 'DB connection error'))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://olx-pakistan-cb51c.firebaseio.com"
});

app.set("view engine", "pug")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(fileUpload())

app.set("port", process.env.PORT || 3000)
app.use("/static", express.static(path.join(__dirname, "public")))
app.use("/", express.static(path.join(__dirname, "firebase-messaging-sw.js")))

app.use(session({
    secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

app.use(routes);
app.use(Rest_API)


app.use(function (req, res, next) {
    const error = new Error("File Not Found")
    error.status = 404
    next(error)
})

app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.send(`<h1 style="text-align:center;">${err}</h1>`)
    next()
})

app.listen(app.get("port"), function () {
    console.log("Server started on port " + app.get("port"));
});