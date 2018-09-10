$("document").ready(function () {
    $('select').formSelect();
        
    $(".dropdown-trigger").css("visibility", "hidden")

    $(".more-icon").on("click", function () {
        $(".dropdown-trigger")[0].click()
    })

    $('.modal').modal();

    $("#modal3").modal({
        onCloseStart: () => fullAdLoader(true)
    })
})


var cat = $("#search-select").val()
var t = $("#search").val()



function createAdHTML(res, me, noPaginate) {
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
        noPaginate === undefined && (createPagination(me))

    }
}

function createPagination(me) {
    fetch(`/ads/total?cat=${cat}&t=${t}${me ? "&which=me" : ''}`)
        .then(res => res.json())
        .then(res => {
            if (res) {

                let total = res.count
                console.log(total)
                total = Math.ceil(total / 10)

                let paginateHTML = ""

                if (res.count > 10) {
                    for (let i = 0; i < total; i++) {
                        paginateHTML += `<li class="waves-effect paginate"><a 
                data-target="/ads/get/${i}?cat=${cat}&t=${t}${me ? "&which=me" : ''}" data-method="GET" data-disabled="true" >${i + 1}</a></li>`
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

function fetchAds(url = `/ads/get/0?cat=${cat}&t=${t}`, me) {
    fetch(url)
        .then(res => res.json())
        .then(res => {
            console.log(res)
            createAdHTML(res, me)
        })
        .catch(err => {
            console.log(err)
        })
}

function createAdDetails(res) {
    console.log(res)
    if (res.creator._id === JSON.parse(localStorage.getItem("u_info"))._id) {
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
            <a class="waves-effect waves-light btn" href="/message/${res.creator._id}">
            <i class="material-icons left">message</i>
                <span>Message</span>
            </a>
            </div>
            <br />

            <div id="save" data-id=${res._id}>
            <a class="btn waves-effect waves-teal">
            <i class="material-icons left">restore_page</i>
                <span>Save</span>
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

    fullAdLoader(false)
    $("#modal3").css("overflow", "auto")
}

/*------------------------------
    POPULATE FULL_AD_MODAL
--------------------------------*/
function fullAdDetails() {
    $("#all-ads").on("click", ".ad-view", function () {
        fetch(`/ads/details/${this.id}`)
            .then(res => res.json())
            .then(res => {
                createAdDetails(res)
            })
            .catch(err => console.log(err))

    })
}

function save(data, id) {

    let offline_data = JSON.parse(localStorage.getItem("offline_data"))

    if (offline_data) {
        if (!offline_data[id]) {
            offline_data[id] = [data]
            localStorage.setItem("offline_data", JSON.stringify(offline_data))

        } else {
            var exist = false
            var Data = offline_data[id]
            Data.forEach(d => {
                if (d._id === data._id) { return exist = true } 
            })
            if (!exist) {
                Data.unshift(data)
                localStorage.setItem("offline_data", JSON.stringify(offline_data))
                M.toast({html: "Saved", displayLength: 1000})
            } else {
                M.toast({html: "Already Saved!", displayLength: 1000})
            }

        }

    } else {
        let ads = {}
        ads[id] = [data]
        localStorage.setItem("offline_data", JSON.stringify(ads))
        M.toast({html: 'Saved!', displayLength: 1000})
    }
}

(function saveOffline() {
    $(".message-or-del-div").on("click", "#save", function(e) {
        let id = JSON.parse(localStorage.getItem("u_info"))._id
        fetch(`/ads/details/${$(this).attr("data-id")}`)
        .then(res => res.json())
        .then(data => {
            data.images =  data.images.map(img => getBase64(img))
            console.log(data)
            //save(data, id)
        })
        .catch(err => console.log(err))
    })
})();

function fullAdLoader(show) {
    if (show) {
        $(".full-ad-content").css("visibility", "hidden")
        $(".preloader-wrapper").css("display", "")
        $("#modal3").css("overflow", "hidden")
    } else {
        $(".full-ad-content").css("visibility", "visible")
        $(".preloader-wrapper").css("display", "none")
    }
}

/*------------------------------
    DELETE BUTTON
--------------------------------*/
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
    PAGINATION
--------------------------------*/
$(".pagination").on("click", "a", function (e) {

    // $("li a").parent().removeClass("active")

    let url = $(this).attr("data-target")

    if (url) {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        fetchAds(url, url.includes("&which=me") ? true : false)
        $(this).parent().addClass("active")
    }
})

$("#search-select").on("change", function () {
    cat = $(this).val()
})

$(".img-box").on("click", function (e) {
    let imgUrl = this.style.backgroundImage
    $(".full-ad-img-div")[0].style.backgroundImage = imgUrl
})
