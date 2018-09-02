FormData.prototype.toJSON = function() {
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



 function showLoader(show) {
    if (show) {
        $("#loader-content,#messages").css("display", "none")
        $(".preloader-wrapper").css("display", "")
    } else {
        $("#loader-content,#messages").css("display", "")
        $(".preloader-wrapper").css("display", "none")
    }
}

 function updateLocalData(data) { 
    if (localStorage.getItem("u_info") === null) {
        var user_info = JSON.stringify(data)
        localStorage.setItem("u_info", user_info)
    }
}