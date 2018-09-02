$(document).ready(function () {
    /*------------------------------
        User Login
    --------------------------------*/
    $("#login-form").on("submit", function (e) {
        e.preventDefault()
        let formData = new FormData(e.target)

        if (Validator(formData)) {
            showLoader(true)
            formData = formData.toJSON()

            fetch("/", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    $(`#${res.field}`).addClass("invalid")
                    $(`#${res.field}-error`).attr("data-error", res.message)
                    showLoader(false)
                } else {
                    console.log("Success:", res)
                    updateLocalData(res)
                    window.location.replace("/home")
                }

            })
            .catch(err => {
                showLoader(false)
                console.log(err)
            })
        }
    })
})