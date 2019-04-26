// =========================================================================================================================
// Initialize Firebase
// =========================================================================================================================

var config = {
    apiKey: "AIzaSyButBMTK9NxMSyqJPNVvIoxyBgYmMMu0qs",
    authDomain: "harmoniq.firebaseapp.com",
    databaseURL: "https://harmoniq.firebaseio.com",
    projectId: "harmoniq",
    storageBucket: "harmoniq.appspot.com",
    messagingSenderId: "604012143278"
  };
  firebase.initializeApp(config);

var firebaseDB = firebase.database();


// =========================================================================================================================
// Global Variables
// =========================================================================================================================

// API Keys
const musicApiKey = "cd406979493ca39852ad6ce1bcb6dbd5";
const ticketMasterApiKey = "5ELeAvJcyCqqiNidXz1z1MViy9Rc22cH";

 


// =========================================================================================================================
// GET ZIP CODE
// =========================================================================================================================

$(document).on("click",".fas", async function() {
  
    const {value: text} = await Swal.fire({title: 'Enter Zipcode!',
        text: 'Enter your zip code to see events near you!.',
        imageUrl: 'https://unsplash.it/400/200',
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: 'Custom image',
        animation: false,
        input: 'text',
        inputPlaceholder: 'Type your message here...',
        showCancelButton: true
      })
      
      if (text) {
        if(!isNaN(text) && text< 100000) {
            var zipCode = text;
            ticketSearch($(this).attr("artist"), zipCode);
        }
        else {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                footer: '<a href>Why do I have this issue?</a>'
              })
        }
      }

});

//purchase button new window
$("#purchase").on("click", function() {
    window.open($(this).attr("href"),"_blank");
});


// =========================================================================================================================
// API: MUSIXMATCH - FOR SEARCH BY SONG
// CREATE TABLE OF RESULTS
// requires a string of any song name
// returns an array of 5 objects of the results
// object contains: album name, artist name, and the song name
// =========================================================================================================================

function searchBySong(song) {
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
        let result = [];
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
        createTableSong(result, song);
      //  songDatabaseUpdate(result);
    });
}


// =========================================================================================================================
// API: MUSIXMATCH - FOR SEARCH BY ARTIST NAME
// CREATE TABLE OF RESULTS
// requires a string of an artist
// returns an array of 5 objects of the results
// object contains: album name, artist name, and the song name
// =========================================================================================================================

function searchByArtist(artist) {
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
        let result = [];
        let listArray = response.message.body.artist_list;
        listArray.forEach(element => {
            let track = {
                artistName: element.artist.artist_name,
                songName: "",
                albumName: "",
                twitterUrl: element.artist.artist_twitter_url
            }
            result.push(track);
            
        });
        createTableArtist(result, artist);
    });
}



// =========================================================================================================================
// API: TICKETMASTER - SEARCH FOR EVENTS
// search for an event
// returns an array of event objects
// =========================================================================================================================

function ticketSearch(searchTerm, zipCode) {
   
    $.ajax({
        type:"GET",
        url:"https://app.ticketmaster.com/discovery/v2/events.json",
        data: {
            apikey: ticketMasterApiKey,
            keyword: searchTerm,
            includeSpellcheck: "yes",
            size: 1
        },
        dataType: "json",
        success: function(response) {
            try {
                console.log(response);
                var result = [];
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
                        country: element._embedded.venues[0].country.name,
                        countryCode: element._embedded.venues[0].country.countryCode,
                        eventUrl: element._embedded.venues[0].url
                    }
                    result.push(event);
                    populateModal(result);
                    $("#exampleModal").modal("show");

                });
            }catch(exception) {
                result = [{}];
                console.log("no results");

                Swal.fire({
                    type: 'error',
                    title: 'No events found'
                  });
            }
            console.log(result);
            }
        
      });
}



// =========================================================================================================================
// SEARCH BY ARTIST NAME: API CALL TO MUSIXMATCH
// CREATE TICKET MODAL
// =========================================================================================================================

$("#artistBtn").on("click", function(event) {
    event.preventDefault();
  
    console.log("this:", this);
  
    // Trim spaces from user input
    var artist = $("#searchTerm").val().trim();
    console.log("artist:", artist);

    searchByArtist(artist);
  
  });

//Ticket modal
function populateModal(resultList) {
    resultList.forEach(event => {
        $("#modalTital").text(event.eventName);

        $("#address").text(event.address);
        $("#city").text(event.city);
        $("#country").text(event.country);
        $("#date").text(event.date);
        $("#genre").text(event.genre);
        $("#status").text(event.status);
        $("#purchase").attr("href", event.eventUrl);
    });
}



// =========================================================================================================================
// SEARCH BY SONG NAME: API CALL TO MUSIXMATCH
// =========================================================================================================================

$("#songBtn").on("click", function(event) {
    event.preventDefault();
  
  
    // Trim spaces from user input
    var song = $("#searchTerm").val().trim();
    console.log(song);
    searchBySong(song);

    // Push user input to firebase database
    
  
    // Clear input field
    $("#searchTerm").val("");
  
  });


  function songDatabaseUpdate(objects) {
      
    objects.forEach(object => {
        firebaseDB.ref().push({
            resultNum: object.resultNum,   
            songName: object.songName,
            artistName: object.artistName,
            albumName: object.albumName,
            social: object.social,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
    })
  }



// =========================================================================================================================
// CREATE AND POPULATE HTML TABLE - FOR ARTIST SEARCH RESULTS
// =========================================================================================================================

function createTableArtist(result, artist) {

    var tableHeader = $("#tableId");

    $(tableHeader).html("<thead class='thead-light'>" +
        "<tr>" +
            "<th scope='col'>Result</th>" +
            "<th scope='col'>Artist</th>" +
            "<th scope='col'>Social</th>" +
            "<th scope='col' id = 'thAction' colspan='4'>Events</th>" +
        "</tr>" +
    "</thead>");

    result.forEach(function(element, index) {
        index++;

        var row = $("<tr>");

        var id = $("<td>").text(index);
        var artist = $("<td>").text(element.artistName);
        var twitterUrl = $("<td>").text(element.twitterUrl);

        var ticketBtn = $("<i class='fas fa-ticket-alt'></i>").attr("id", index);
        $(ticketBtn).attr("artist", element.artistName);

        $(row).append(id);  
        $(row).append(artist); 
        $(row).append(twitterUrl); 
        $(row).append(ticketBtn);

        $("#tableId").append(row);
        index++;
    });

        var databaseSave = {
            searchValue: artist,
            ua: ua,
            record: result,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        }

        // push results to Firebase
        firebaseDB.ref().push(databaseSave);
   
};

var ua= navigator.userAgent;
localStorage.setItem("user agent",ua);
console.log("ua", ua);

// =========================================================================================================================
// CREATE AND POPULATE HTML TABLE - FOR SONG SEARCH RESULTS
// =========================================================================================================================

function createTableSong(result, song) {

    var tableHeader = $("#tableId");

    $(tableHeader).html("<thead class='thead-light'>" +
        "<tr>" +
            "<th scope='col'>Result</th>" +
            "<th scope='col'>Song Title</th>" +
            "<th scope='col'>Artist</th>" +
            "<th scope='col'>Album</th>" +
            "<th scope='col'>Social</th>" +
            "<th scope='col' id = 'thAction' colspan='4'>Events</th>" +
        "</tr>" +
    "</thead>");

var obj = {};
var myJSON;

    result.forEach(function(element, index) {
        index++;

        var row = $("<tr>");

        var id = $("<td>").text(index);
        var song = $("<td>").text(element.songName);
        var artist = $("<td>").text(element.artistName);
        var album = $("<td>").text(element.albumName);
        var twitterUrl = $("<td>").text(element.twitterUrl);

        var ticketBtn = $("<i class='fas fa-ticket-alt'></i>").attr("id", index);
        $(ticketBtn).attr("artist", element.artistName);

        $(row).append(id);  
        $(row).append(song); 
        $(row).append(artist); 
        $(row).append(album); 
        $(row).append(twitterUrl); 
        $(row).append(ticketBtn);

        $("#tableId").append(row);

    });

    var databaseSave = {
        searchValue: song,
        ua: ua,
        record: result,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    }

        // push results to Firebase
        firebaseDB.ref().push(databaseSave);
   
};


  /* 
// =========================================================================================================================
// PUSH DATA TO FIREBASE REALTIME DATABASE
// =========================================================================================================================

firebaseDB.ref().on("child_added", function(childSnapshot) {

     //Push search results to Firebase database

    result.forEach(function(element, index) {

        firebaseDB.ref().push({
            id: index,
            song: element.songName,
            artist: element.artistName,
            album: element.albumName,
            twitterUrl: element.twitterUrl,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        index++;
    });
});








// =========================================================================================================================
// GET DATA FROM FIREBASE REALTIME DATABASE
// =========================================================================================================================

firebaseDB.ref().on("child_added", function(childSnapshot) {

    //console.log("Number of records in Firebase: "+childSnapshot.numChildren());
    //console.log("childSnapshot.val(): ", childSnapshot.val()); // gives field details
  
    // Data from Firebase
    id = childSnapshot.val().id;
    song = childSnapshot.val().song;
    artist = childSnapshot.val().artist;
    album = childSnapshot.val().album;
    twitterUrl = childSnapshot.val().twitterUrl;

    var keyId = childSnapshot.key;
    //console.log("keyId: ", keyId);
       
    // Error Handler
    }, function(errorObject) {
      console.log("firebase return error: " + errorObject.code);
  });
  




// =========================================================================================================================
// UPDATE FIREBASE
// =========================================================================================================================

    // Update firebase database
    firebaseDB.ref(keyId).update({
        // enter ticket master results??
        zipCode: zipCode,
    });


  
  */
  
