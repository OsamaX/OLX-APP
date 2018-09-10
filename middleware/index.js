const admin = require('firebase-admin')

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

function sendPushNotification(token, name, uid) {
    var registrationToken = token

    var message = {
        "webpush": {
            "notification": {
                "title": "You have a new message 🖂",
                "body": `${name} sent you a message`,
                "icon": "firebase-logo.png",
                "image": `/message/${uid}`,
                "click_action": `http://localhost:3000/message/${uid}`            
            }
        },
        token: registrationToken
    };

    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });

}

module.exports.requireLogIn = requireLogIn
module.exports.loggedOut = loggedOut
module.exports.sendPushNotification = sendPushNotification
