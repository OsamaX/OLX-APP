const data = JSON.parse(localStorage.getItem("offline_data"))

if (data) {

    const id = JSON.parse(localStorage.getItem("u_info"))._id

    createAdHTML(data[id], null, true)

    $("#all-ads").on("click", ".ad-view", function () {
        const adId = this.id

        data[id].forEach(ad => {
            if (ad._id === adId) {
                createAdDetails(ad)
            }
        })

    })

}


