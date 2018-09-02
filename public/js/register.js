$(document).ready(function () {
    /*------------------------------
        User Registration
    --------------------------------*/
    $("#register-form").on("submit", function (e) {
        e.preventDefault()
        let form = new FormData(e.target)

        if (Validator(form)) {
            if (form.get("password") !== form.get("re_pass")) {
                $("#re-password").addClass("invalid")
            } else {
                showLoader(true)

                form = form.toJSON()
                delete form.re_pass
                fetch("/register", {
                    method: 'POST',
                    body: JSON.stringify(form),
                    headers: {
                        "Content-Type": "application/json"
                    }

                }).then(res => res.json())
                    .then(res => {
                        if (res.error) {
                            const fields = Object.keys(res)
                            fields.forEach(field => {
                                $(`#${field}-error`).attr("data-error", res[field])
                                $(`#${field}`).addClass("invalid")
                            })
                            showLoader(false)
                        } else {
                            console.log('Success:', res)
                            updateLocalData(res)
                            window.location.replace("/home")
                        }

                    })
                    .catch(error => {
                        console.error('Error:', error)
                        showLoader(false)
                    })
            }
        }
    })

})

