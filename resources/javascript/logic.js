const musicApiKey = "cd406979493ca39852ad6ce1bcb6dbd5";

$(document).ready(function() {

});


//search by song
//requires a string of any song name
// returns an array of 5 objects of the results
//object contains: album name, artist name, and the song name
function searchBySong(song) {
    var result =[];
    $.ajax({
        data: {
            apikey: musicApiKey,
            q_track: song,
            page_size: 5,
            format:"jsonp",
            callback:"jsonp_callback"
        },
        url: "https://api.musixmatch.com/ws/1.1/track.search",
        method: "GET",
        dataType: "jsonp",
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json',

    }).then(function(response) {
        let listArray = response.message.body.track_list;
        listArray.forEach(element => {
            let track = {
                albumName: element.track.album_name,
                artistName: element.track.artist_name,
                songName: element.track.track_name
            }
            result.push(track);
        });
        console.log(result);
        return result;
    });
}

//search by an artist name
function searchByArtist(artist) {
    var result =[];
    $.ajax({
        data: {
            apikey: musicApiKey,
            q_artist: artist,
            page_size: 5,
            format:"jsonp",
            callback:"jsonp_callback"
        },
        url: "https://api.musixmatch.com/ws/1.1/artist.search",
        method: "GET",
        dataType: "jsonp",
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json',

    }).then(function(response) {
        let listArray = response.message.body.artist_list;
        listArray.forEach(element => {
            let track = {
                artistName: element.artist.artist_name,
                twitterUrl: element.artist.artist_twitter_url
            }
            result.push(track);
        });
        console.log(result);
        return result;
    });
}