$(document).ready(function () {

    const name = JSON.parse(localStorage.getItem("u_info")).name.split(" ")[0]
    $(".user-name").text(name)

    fetchAds()

    $("#modal1").modal({
        onOpenStart: () => $(".dropdown-trigger").css("visibility", "visible"),

        onCloseStart: () => $(".dropdown-trigger").css("visibility", "hidden")
    })


    /*------------------------------
        POPULATE PROFILE FORM FIELDS
    --------------------------------*/
    var form = $(".profile-form")[0]
    var u_data = localStorage.getItem("u_info")
    u_data = JSON.parse(u_data)

    for (i in u_data) {
        if (form.elements[i]) {
            form.elements[i].value = u_data[i]
        }

    }

    /*------------------------------
        UPDATE PROFILE
    --------------------------------*/
    $(".profile-form").on("submit", function (e) {
        e.preventDefault()

        let form = new FormData(this)

        fetch("/profile/update", {
            method: "PUT",
            body: form

        })
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    const fields = Object.keys(res)
                    fields.forEach(field => {
                        $(`#${field}-error`).attr("data-error", res[field])
                        $(`#${field}`).addClass("invalid")
                    })

                } else if (res) {
                    localStorage.removeItem("u_info")
                    updateLocalData(res)
                    $("#modal2").modal("close")
                    M.toast({ html: "Profile Updated", displayLength: 2000 })
                }

            })
            .catch(err => console.log(err))

    })

    /*------------------------------
        SEARCH AD
    --------------------------------*/
    $("#search").on("keyup", function (e) {
        t = $("#search").val()

        fetchAds(`/ads/get/0?cat=${cat}&t=${t}`)
    })

    /*------------------------------
        POPULATE FULL_AD_MODAL
    --------------------------------*/
    fullAdDetails()


    /*------------------------------
        CREATE AD
    --------------------------------*/
    $(".ad-form").on("submit", function (e) {
        e.preventDefault()
        let form = new FormData(e.target)
        let files = Array.from($("input[type='file']").get(0).files)

        if (form.get("category") === null) {
            $(".select-dropdown").addClass("validate invalid")
            form.set("category", "")
        }

        if (files.length > 3) {
            $("#images-error").attr("data-error", "You can only upload up to 3 files")
            $("#images").addClass("invalid")
        }

        if (JSON.parse(localStorage.getItem("u_info")).city.trim().length === 0) {
            return M.toast({ html: 'Fill Profile first!', displayLength: 2000 })
        }

        if (Validator(form)) {
            // showsLoader(true)

            files.forEach(file => {
                form.append('photos[]', file, file.name)
            })

            fetch("/create", {
                method: "POST",
                body: form,
            })
                .then(res => res.json())
                .then(res => {
                    if (res.error) {
                        const fields = Object.keys(res)
                        fields.forEach(field => {
                            $(`#${field}-error`).attr("data-error", res[field])
                            $(`#${field}`).addClass("invalid")
                        })
                        // showsLoader(false)

                    } else {
                        // showsLoader(false)
                        M.toast({ html: "AD created", displayLength: 2000 })
                        window.location.reload()
                    }

                })
                .catch(err => {
                    // showsLoader(false)
                    console.log("Error", err)
                })
        }

    })

})
