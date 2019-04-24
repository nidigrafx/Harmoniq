// =========================================================================================================================
// Initialize Firebase
// =========================================================================================================================

var config = {
    apiKey: "AIzaSyBm_ki9wJ9ffmrKSINeopKCXy4vIjYb0qw",
    authDomain: "harmoniq-f9417.firebaseapp.com",
    databaseURL: "https://harmoniq-f9417.firebaseio.com",
    projectId: "harmoniq-f9417",
    storageBucket: "harmoniq-f9417.appspot.com",
    messagingSenderId: "437101250670"
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
// ZipCode
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


// =========================================================================================================================
// API: MUSIXMATCH - SEARCH BY SONG
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
        createTable(result);
      //  songDatabaseUpdate(result);
    });
}


// =========================================================================================================================
// API: MUSIXMATCH - SEARCH BY ARTIST NAME
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
        createTable(result);
    });
}



// =========================================================================================================================
// API: TICKETMASTER - SEARCH BY SEARCH TERM AND ZIP CODE
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
            size: 1,
            postalcode: zipCode
        },
        dataType: "json",
        success: function(response) {
            try {
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
                        countryCode: element._embedded.venues[0].country.countryCode
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
// PUSH DATA TO FIREBASE REALTIME DATABASE
// =========================================================================================================================

    // Push search results to Firebase database
    // for(var i = 0; i < result.length; i++) {
    
    //     firebaseDB.ref().push({
    //         artistName: result[i].artistName,
    //         twitterUrl: result[i].songName,
    //         dateAdded: firebase.database.ServerValue.TIMESTAMP
    //     });
    // }




// =========================================================================================================================
// SEARCH BY ARTIST NAME BUTTON CLICKED
// Musixmatch API Call 
// Create and populate HTML table
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
    });
}


// =========================================================================================================================
// CREATE AND POPULATE HTML TABLE
// =========================================================================================================================

function createTable(result) {

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
        index++;
    });
   
};



// =========================================================================================================================
// SEARCH BY SONG NAME BUTTON CLICKED: (1) API CALL TO MUSIXMATCH; (2) PUSH DATA TO FIREBASE REALTIME DATABASE
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

  /* 

// =========================================================================================================================
// GET DATA FROM FIREBASE REALTIME DATABASE
// =========================================================================================================================

firebaseDB.ref().on("child_added", function(childSnapshot) {

    //console.log("Number of records in Firebase: "+childSnapshot.numChildren());
    //console.log("childSnapshot.val(): ", childSnapshot.val()); // gives field details
  
    // Data from Firebase
    resultNum = childSnapshot.val().resultNum;
    songName = childSnapshot.val().songName;
    artistName = childSnapshot.val().artistName;
    albumName = childSnapshot.val().albumName;
    social = childSnapshot.val().social;

    var keyId = childSnapshot.key;
    //console.log("keyId: ", keyId);
       
    // Error Handler
    }, function(errorObject) {
      console.log("firebase return error: " + errorObject.code);
  });
  
*/

// =========================================================================================================================
// DELETE TABLE ROW
// =========================================================================================================================

deleteRow = function (num) {
    var rowDeleted = num;
    
    console.log("rowDeleted:", rowDeleted);
    document.getElementById("tableId").deleteRow(num);
  
  
    for(var i = 0; i < dbRecordCount; i++) {
  
      if(music[i].record === rowDeleted) {
        keyId = music[i].keyId;
  
        console.log("rowDeleted", rowDeleted);
        console.log("music[i].record", music[i].record);
        console.log("keyId", keyId);
      }
    }
  
    // Push user input to firebase database
    firebaseDB.ref(keyId).remove();
  
  }


// =========================================================================================================================
// TICKETMASTER BUTTON CLICKED: GET USER ZIPCODE
// =========================================================================================================================

ticketMasterRow = function (num) {
       
    document.getElementById("tBtn_r"+num+"c5").style.display="none"; // hide ticketmaster button
    document.getElementById("zip_r"+num+"c6").style.display="block"; // display zip code input field
    document.getElementById("sBtn_r"+num+"c7").style.display="block"; // display submit button
  
  };



// =========================================================================================================================
// TICKETMASTER SUBMIT BUTTON CLICKED: (1) TICKET MASTER API CALL
// =========================================================================================================================

submitRow = function (num) {
    var ticketRow = num;
   
    searchTerm = document.getElementById("r"+num+"c2").value; //this is the Artist Name
    zipCode = document.getElementById("zip_r"+num+"c6").value; //this is the zip code input field
    

    ticketSearch(searchTerm, zipCode);
  
    // Ticketmaster information to UI
    $("#ticketId").append("<p class='tktEvent'>"+event[0].eventName+"</p>" +
                          "<p class='tktEvent'>"+event[0].date+"</p>" +
                          "<p class='tktEvent'>"+event[0].status+"</p>" +
                          "<p class='tktEvent'>"+event[0].genre+"</p>" +
                          "<p class='tktEvent'>"+event[0].address+"</p>" +
                          "<p class='tktEvent'>"+event[0].city+"</p>" +
                          "<p class='tktEvent'>"+event[0].state+"</p>" +
                          "<p class='tktEvent'>"+event[0].stateCode+"</p>" +
                          "<p class='tktEvent'>"+event[0].country+"</p>" +
                          "<p class='tktEvent'>"+event[0].countryCode+"</p>" );


    document.getElementById("tBtn_r"+num+"c5").style.display="block"; // display ticketmaster button
    document.getElementById("zip_r"+num+"c6").style.display="none"; // hide zip code input field
    document.getElementById("sBtn_r"+num+"c7").style.display="none"; // hide submit button

    // Get record key
    for(var i = 0; i < dbCount; i++) {
  
        if(music[i].record === ticketRow) {
          keyId = music[i].keyId;
    
        console.log("music[i].record", music[i].record);
        console.log("keyId", keyId);
        }
    }


    // Update firebase database
    firebaseDB.ref(keyId).update({
        // enter ticket master results??
        zipCode: zipCode,
    });


    // Clear input field
    document.getElementById("zipCode").reset();

  
  }
  
