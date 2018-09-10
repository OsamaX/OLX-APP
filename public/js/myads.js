/*------------------------------
    SEARCH AD
--------------------------------*/
$("#search").on("keyup", function (e) {
    t = $("#search").val()

    fetchAds(`/ads/get/0?cat=${cat}&t=${t}&which=me`, true)
})

fetchAds(`/ads/get/0?cat=${cat}&t=${t}&which=me`, true)

fullAdDetails()