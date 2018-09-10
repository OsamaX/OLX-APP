(function getAllMessages() {
    fetch("/user/message")
        .then(res => res.json())
        .then(res => {
            let html = ""
            
            res.messages.forEach(data => {
                html += `
                <li class="collection-item avatar" onClick="window.location = '${data.url}'">
                <img src="https://api.adorable.io/avatars/285/${data.name}"  class="circle">
                <span class="title">${data.name}</span>
                </p>
                <a href="${data.url}" class="secondary-content"><i class="material-icons">grade</i></a>
                </li>
                `
            })

            $(".collection").append(html)
        })
        .catch(err => console.log(err))
})();



