$("document").ready(function () {
    $('.sidenav').sidenav();

    /*------------------------------
        LOGOUT
    --------------------------------*/
    $("#logout a").on("click", function (e) {
        fetch("/logout", {
            method: "POST"
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    localStorage.removeItem("u_info")
                    localStorage.removeItem("firebase_token")
                    return window.location.replace("/")
                }
            })
            .catch(err => console.log(err))
    })

})



FormData.prototype.toJSON = function () {
    let obj = {}
    for (var pair of this.entries()) {
        obj[pair[0]] = pair[1]
    }
    return obj
}

function Validator(text) {
    let valid = true
    if (typeof text === "object") {
        text.forEach((v, e) => {
            if (!v || v.trim().length == 0 || v === null) {

                if ($(`input[name='${e}']`)[0]) {
                    $(`input[name='${e}']`).addClass("invalid")
                } else {
                    $(`textarea[name='${e}']`).addClass("invalid")
                }

                $(`#${e}-error`).css("color", "red")
                valid = false
            }
        })
        return valid
    } else {
        if (!text || text.trim().length == 0) {
            return false
        } else {
            return text
        }
    }

}

function sendToServer(token) {
    if (token && localStorage.getItem('firebase_token') !== token) {
        console.log("token: ", token)
        fetch("/save_token", {
            method: "POST",
            body: JSON.stringify({ token }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(res => localStorage.setItem('firebase_token', res.token))
            .catch(err => console.log(err))
    }

}

function sendPushRequest() {
    let url = location.href
    let loc = url.indexOf("message")
    url = url.slice(loc)

    url = url.split("/")

    const uid = url[1]

    fetch("/push_notification",
        {
            method: "POST",
            body: JSON.stringify({ uid }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(res => res.json())
        .then(res => console.log(res))
        .catch(err => console.log(err))
}


function showLoader(show) {
    if (show) {
        $("#loader-content,#messages").css("display", "none")
        $(".preloader-wrapper").css("display", "")
    } else {
        $("#loader-content,#messages,#send-msg-box").css("display", "")
        $(".preloader-wrapper").css("display", "none")
    }
}

function updateLocalData(data) {
    if (localStorage.getItem("u_info") === null) {
        var user_info = JSON.stringify(data)
        localStorage.setItem("u_info", user_info)
    }
}
