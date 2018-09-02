$(document).ready(function () {
    $('.modal').modal();
    $('select').formSelect();

    $(".dropdown-trigger").css("visibility", "hidden")

    var cat = $("#search-select").val()
    var t = $("#search").val()

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
                M.toast({html: "Profile Updated", displayLength: 2000})
            }

        })
        .catch(err => console.log(err))

    })

    /*------------------------------
        POPULATE FULL_AD_MODAL
    --------------------------------*/
    $("#all-ads").on("click", ".ad-view", function () {
        fetch(`/ads/details/${this.id}`)
            .then(res => res.json())
            .then(res => {
                console.log(res)
                if( res.creator._id === JSON.parse(localStorage.getItem("u_info"))._id ) {
                    $(".message-or-del-div").html(`
                    <div id="delete">
                    <a class="waves-effect waves-light btn delete-btn" id=${res._id}>
                    <i class="material-icons left">delete</i>
                        <span>Delete</span>
                    </a>
                    </div>
                    `)

                } else {
                    $(".message-or-del-div").html(`
                    <div id="message">
                    <a class="waves-effect waves-light btn" href="/message/${res.creator._id}/${res._id}">
                    <i class="material-icons left">message</i>
                        <span>Message</span>
                    </a>
                    </div>
                    `)
                }

                $(".img-box").removeAttr("style")
                let images = res.images

                $("#ad-title").text(res.title)
                $(".full-ad-img-div").attr("style", `background-image:url(${images[0].replace(/\\/g,
                    "/")})`)

                images.forEach((img, i) => {
                    $(`#box-${i}`).attr(
                        "style", `background-image:url(${img.replace(/\\/g, "/")}); display: inline-block`
                    )
                })

                $("#ad-price").text(`Price: ${res.price}`)
                $("#seller-name").text(res.creator.name)
                $("#seller-num").text(res.creator.phone)
                $("#seller-city").text(res.creator.city)
                $("#desc").text(res.description)

            })
            .catch(e => console.log(err))

    })


    $(".message-or-del-div").on("click", ".delete-btn", function () {
        fetch(`/ads/delete/${this.id}`, {
            method: "DELETE"
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                window.location.reload()
            }
        })
        .catch(err => console.log(err))
        
    })

    /*------------------------------
        BACK BUTTON
    --------------------------------*/
    $(".back-btn").on("click", function (e) {
        $("#modal3").modal("close")
    })

    /*------------------------------
        CANCEL BUTTON
    --------------------------------*/
    $(".cancel-btn").on("click", function () {
        $(".modal").modal("close")
    })

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

        if(JSON.parse(localStorage.getItem("u_info")).city.trim().length === 0) {
            return M.toast({html: 'Fill Profile first!', displayLength: 2000})
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
                        M.toast({html: "AD created", displayLength: 2000})
                        window.location.reload()
                    }

                })
                .catch(err => {
                    // showsLoader(false)
                    console.log("Error", err)
                })
        }

    })

    /*------------------------------
        PAGINATION
    --------------------------------*/
    $(".pagination").on("click", "a", function (e) {

        // $("li a").parent().removeClass("active")

        let url = $(this).attr("data-target")

        if (url) {
            $("html, body").animate({ scrollTop: 0 }, "slow");
            fetchAds(url)
            $(this).parent().addClass("active")
        }
    })

    /*------------------------------
        SEARCH AD
    --------------------------------*/
    $("#search").on("keyup", function (e) {
        t = $("#search").val()

        fetchAds(`/ads/get/0?cat=${cat}&t=${t}`)
    })

    /*------------------------------
        FETCH ADS Function
    --------------------------------*/
    function fetchAds(url = `/ads/get/0?cat=${cat}&t=${t}`) {
        fetch(url)
            .then(res => res.json())
            .then(res => {
                console.log(res)
                if (res) {

                    if (res.length === 0) {
                        let html = `
                        <h4 id="no-ads-text">No More Ads!</h4>
                        <img src=static/images/no.png class="no-ads"/>`
                        $("#all-ads").html(html)
                        return $(".pagination").css("display", "none")   
                    }

                    let html = ""
                    res.forEach(ad => {
                        html += `               
                    <div class="col s12 m4 l3">
                    <div class="card medium">
                        <div class="card-image">
                            <img src="${ad.images[0]}" class="ad-image">
                            <span class="card-title">${ad.title}</span>
                        </div>
                        <div class="card-content">
                            <p>${ad.description}</p>
                        </div>
                        <div class="card-action">
                            <a href="#">Price: ${ad.price}</a>
                            <a class="ad-view modal-trigger" id="${ad._id}" href="#modal3">VIEW AD</a>
                        </div>

                    </div>
                </div>`
                    })

                    $("#all-ads").html(html)
                    createPagination()

                } 
            })
            .catch(err => {
                console.log(err)
            })
    }

    /*------------------------------
        SEARCH CATEGORY FUNCTION
    --------------------------------*/
    $(".more-icon").on("click", function () {
        $(".dropdown-trigger")[0].click()
    })

    $("#search-select").on("change", function () {
        cat = $(this).val()
    })

    /*------------------------------
        PAGINATION Function
    --------------------------------*/
    function createPagination() {
        fetch(`/ads/total?cat=${cat}&t=${t}`)
            .then(res => res.json())
            .then(res => {
                if (res) {

                    let total = res.count
                    total = Math.ceil(total / 10)

                    let paginateHTML = ""

                    if (res.count > 10) {
                        for (let i = 0; i < total; i++) {
                            paginateHTML += `<li class="waves-effect paginate"><a 
                    data-target="/ads/get/${i}?cat=${cat}&t=${t}" data-method="GET" data-disabled="true" >${i + 1}</a></li>`
                        }

                        $(".pagination").css("display", "")
                        $("#here").html(paginateHTML)

                    } else {
                        $(".pagination").css("display", "none")
                    }


                }
            })
            .catch(err => console.log(err))
    }

    $(".img-box").on("click", function (e) {
        let imgUrl = this.style.backgroundImage
        $(".full-ad-img-div")[0].style.backgroundImage = imgUrl
    })

})



function showsLoader(show) {
    if (show) {
        $("#loader-content,#all-ads").css("visibility", "hidden")
        $(".preloader-wrapper").css("display", "")
    } else {
        $("#loader-content,#all-ads").css("visibility", "visible")
        $(".preloader-wrapper").css("display", "none")
    }
}