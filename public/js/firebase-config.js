  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyD6q9N663uiZVAnsvlwUR6FpywCs2kW_HA",
    authDomain: "olx-pakistan-cb51c.firebaseapp.com",
    databaseURL: "https://olx-pakistan-cb51c.firebaseio.com",
    projectId: "olx-pakistan-cb51c",
    storageBucket: "olx-pakistan-cb51c.appspot.com",
    messagingSenderId: "251263630617"
  };
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.usePublicVapidKey("BDympUgCyh3sXwhCcpoNaWK3mAYfw_D2l4gSp1GJX5e7fPiNM2mL0rRXLTMhHO-9JqzwYuXZgNfmrv9-9n6NfLw");

  messaging.requestPermission()
  .then(function () {
    console.log("Notification permission Granted")

    return messaging.getToken()
  })
  .then(function (token) {
    sendToServer(token)
  })
  .catch(function (err) {
    console.log("Notification permission Denied", err)
  })

  messaging.onMessage(payload => {
    if (location.pathname !== payload.notification.image) {
        M.toast({html: payload.notification.title})
    }
  })

  messaging.onTokenRefresh(function() {
    messaging.getToken().then(function(refreshedToken) {
      console.log('Token refreshed.', refreshedToken);

    }).catch(function(err) {
      console.log('Unable to retrieve refreshed token ', err);
    });
  })