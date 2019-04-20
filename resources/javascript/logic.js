const musicApiKey = "cd406979493ca39852ad6ce1bcb6dbd5";
const ticketMasterApiKey = "5ELeAvJcyCqqiNidXz1z1MViy9Rc22cH";

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
            page_size: 10,
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
            page_size: 10,
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

//search for an event
//takes a search term and a zipcode
//returns an array of event objects
function ticketSearch(searchTerm, zipCode) {
    var result = []

    $.ajax({
        type:"GET",
        url:"https://app.ticketmaster.com/discovery/v2/events.json",
        data: {
            apikey: ticketMasterApiKey,
            keyword: searchTerm,
            size: 1,
            postalcode: zipCode
        },
        dataType: "json",
        success: function(response) {

            let jsonArray = response._embedded.events;

            jsonArray.forEach(element => {
                let event = {
                    eventName: element.name,
                    date: element.dates.start.localDate,
                    status: element.dates.status.code,
                    genre: element.classifications[0].subGenre.name,
                    venueName: element._embedded.venues[0].name,
                    address: element._embedded.venues[0].address.line1,
                    city: element._embedded.venues[0].city.name,
                    state: element._embedded.venues[0].state.name,
                    stateCode: element._embedded.venues[0].state.stateCode,
                    country: element._embedded.venues[0].country.name,
                    countryCode: element._embedded.venues[0].country.countryCode
                }
                result.push(event);
            });
            console.log(result);
            return result;
            }
      });
}