const path = require("path")

function imageUpload(photos) {
    return new Promise((resolve, reject) => {

        if (photos.constructor.name === "Array") {
            let images = []

            if ( !validator(photos) ) {
                return reject({error: true, images: "Invalid Image Type"})

            } else {
                photos.forEach((img, i) => {

                    let imgPath = path.join(__dirname, "../public/images", "/", new Date().getMilliseconds().toString() + photos.name)

                    images.push(imgPath) 
    
                    img.mv(imgPath, (err) => {
                        if (err) return reject(err)
                        
                    })
                })
    
                resolve(images)
            }

        } else if (photos.constructor.name === "Object") {
            let imgPath = ""

            if ( !validator(photos) ) {
                return reject({error: true, images: "Invalid Image Type"})

            } else {
                imgPath = path.join(__dirname, "../public/images", "/", new Date().getMilliseconds().toString() + photos.name)
                console.log(imgPath)
                photos.mv(imgPath, (err) => {
                    if (err) return reject(err)
    
                     return resolve([imgPath])
                })
            }
        }
    })

}

function validator(photos) {
    let valid = true

    if (photos.constructor.name === "Array") {
        photos.forEach(img => {
            if (img.mimetype !== 'image/png' && img.mimetype !== 'image/jpeg') {
                valid = false
                return false
            }
        })

    } else if (photos.constructor.name === "Object") {
        if (photos.mimetype !== 'image/png' && photos.mimetype !== 'image/jpeg') {
            valid = false
            return false
        }
    }

    return valid
}

module.exports = imageUpload