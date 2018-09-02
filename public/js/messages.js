const db = firebase.database() 

let user = JSON.parse(localStorage.getItem("u_info"))

let uid = user._id
let senderId = user.phone
let reciverId = $("#reciver").val()

let chatId = parseInt(senderId) + parseInt(reciverId)

function saveToInbox() {
    firebase.database().ref(`/messages/${chatId}`).once('child_added').then(function(snapshot) {

        if (snapshot.val()) {

            console.log("inside...")
            let user = {
                uid: location.pathname.split('/')[2],
                adId: $("#adId").val()
            }
        
            fetch(`/user/message`, {
                method: "POST",
                body: JSON.stringify(user),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(res => res.json())
            .then(res => console.log(res))
            .catch(err => console.log(err))
        } else {
            showLoader(false)
        }

      })
}

function sendMessage(msg) {

    return db.ref(`/messages/${chatId}`).push({
        name: user.name,
        text: msg,
        time: new Date().toLocaleTimeString(),
        id: uid
    })
    .catch(err =>  console.log("Error ", err))
}

function displayMessage() {
    db.ref(`/messages/${chatId}`).limitToLast(12).on('child_added', (snap) => {
        let data = snap.val()

        let html = `<div class="message ${data.id !== uid ? 'message-left' : ''}">
            <p class="sender-name">${data.name}</p>
            <p class="mg-top">${data.text}</p>
            <span class="time-stamp">${data.time}</span>
        </div>`

        $("#messages").append(html)
        showLoader(false)
    })
}

function scrollToBottom() {
    let chat_Body = document.getElementById("messages");
    chat_Body.scrollTop = chat_Body.scrollHeight;
}



displayMessage()

$("#message-form").on("submit", function(e) {
    e.preventDefault()
    let text = $("input[name='message']")

    if (text.val().trim().length > 0) {
        sendMessage(text.val())
        scrollToBottom()
        text.val('')
    }

})

saveToInbox()

/*------------------------------
    LOGOUT
--------------------------------*/
$("#logout").on("click", function (e) {
    fetch("/logout", {
        method: "POST"
    })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                localStorage.removeItem("u_info")
                return window.location.replace("/")
            }
        })
        .catch(err => console.log(err))
})