var Twit = require('twit');
var fs = require('fs');
var request = require('request');


let bot = new Twit({
    consumer_key: process.env.Learning_Bot_Consumer_Key,
    consumer_secret: process.env.Learning_Bot_Consumer_Secret,
    access_token: process.env.Learning_Bot_Access_Token,
    access_token_secret: process.env.Learning_Bot_Access_Token_Secret,
    timeout_ms: 60 * 1000,
});

function getPhoto() {
    var parameters = {
        url: 'https://api.nasa.gov/planetary/apod',
        qs: {
            api_key: process.env.NASA_KEY
        },
        encoding: 'binary'
    }
    request.get(parameters, function(err, response, body) {
        body = JSON.parse(body)
        saveFile(body, 'nasa.jpg')
    })
}



function saveFile(body, filename) {
    var file = fs.createWriteStream(filename)
    request(body).pipe(file).on('close', function(err) {
        if (err) {
            console.log(err)
        } else {
            console.log('file saved')
            var descriptionText = body.title

            uploadMedia(descriptionText, filename)
        }
    })
}



function uploadMedia(descriptionText, filename) {
    var filePath = __dirname + '/' + filename;
    bot.postMediaChunked({ file_path: filePath }, function(err, data, response) {
        if (err) {
            console.log(err)
        } else {
            var params = {
                status: descriptionText,
                media_ids: data.media_id_string
            }
            console.log(params)
            postStatus(params)
        }

    })
}

function postStatus(params) {
    bot.post('statuses/update', params, function(err, data, response) {
        if (err) {
            console.log(err)
        } else {
            console.log('tweet post completed')
        }
    })
}




setInterval(function() {
    getPhoto()
}, 43200000)