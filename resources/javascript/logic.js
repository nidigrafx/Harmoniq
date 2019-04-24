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

// API Result Array


// Firebase record count
var dbCount = 0;




// =========================================================================================================================
// API: MUSIXMATCH - SEARCH BY SONG
// requires a string of any song name
// returns an array of 5 objects of the results
// object contains: album name, artist name, and the song name
// =========================================================================================================================

function searchBySong(song) {
    var result = [];
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
    var result = [];
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


// =========================================================================================================================
// CREATE AND POPULATE HTML TABLE
// =========================================================================================================================

function createTable(result) {
    console.log("----start of create table------");
    console.log(result);
    var tableBody = $("#tableId");

    $(tableBody).html("<thead class='thead-light'>" +
        "<tr>" +
            "<th scope='col'>Result</th>" +
            "<th scope='col'>Song Title</th>" +
            "<th scope='col'>Artist</th>" +
            "<th scope='col'>Album</th>" +
            "<th scope='col'>Social</th>" +
            "<th scope='col' id = 'thAction' colspan='4'>Events</th>" +
        "</tr>" +
    "</thead>");

    for (var i = 0; i < result.length; i++) {
        debugger
        console.log(result[i]);
        var id = $("<td>").text(i);
        var song = $("<td>").text(result[i].songName);
        var artist = $("<td>").text(result[i].artistName);
        var album = $("<td>").text(result[i].albumName);
        var twitterUrl = $("<td>").text(result[i].twitterUrl);

        $("#tBodyId").append(id);  
        $("#tBodyId").append(song); 
        $("#tBodyId").append(artist); 
        $("#tBodyId").append(album); 
        $("#tBodyId").append(twitterUrl); 




        // $(".tBodyClass").append("<tr class='r"+i+"'>" +
        //     "<td id='r"+i+"c"+0+"'>"+i+"</td>" +
        //     "<td id='r"+i+"c"+1+"'>"+result[i].songName+"</td>" +
        //     "<td id='r"+i+"c"+2+"'>"+result[i].artistName+"</td>" +
        //     "<td id='r"+i+"c"+3+"'>"+result[i].albumName+"</td>" +
        //     "<td id='r"+i+"c"+4+"'>"+result[i].twitterUrl+"</td>" +
  
        //     "<td id='r"+i+"c"+5+"'>"+
        //         "<input type='button' class='tblBtn' id='tBtn_r"+i+"c"+5+"' onclick='ticketMasterRow("+i+")' value='Ticketmaster'>" +
        //     "</td>" +

        //     "<td id='r"+i+"c"+6+"'>"+
        //         "<input type='text' class='tblZip' id='zip_r"+i+"c"+6+"')' style='display: none;' required placeholder='Enter Zip Code'>" +
        //     "</td>" +
        
        //     "<td id='r"+i+"c"+7+"'>"+
        //         "<input type='button' class='tblBtn' id='sBtn_r"+i+"c"+7+"' onclick='submitRow("+i+")' style='display: none;' value='Submit'>" +
        //     "</td>" + 

        //     "<td id='r"+i+"c"+8+"'>"+
        //         "<input type='button' class='tblBtn' id='dBtn_r"+i+"c"+8+"' onclick='deleteRow("+i+")' value='Remove'>" +
        //     "</td>" +
        // "</tr>");
    }
   
};



// =========================================================================================================================
// SEARCH BY SONG NAME BUTTON CLICKED: (1) API CALL TO MUSIXMATCH; (2) PUSH DATA TO FIREBASE REALTIME DATABASE
// =========================================================================================================================

$("#songBtn").on("click", function(event) {
    event.preventDefault();
  
    console.log("this:", this);
  
    // Trim spaces from user input
    var song = $("#searchTerm").val().trim();
    
    searchBySong(song);

    // Push user input to firebase database
    firebaseDB.ref().push({
        resultNum: resultNum,
        songName: songName,
        artistName: artistName,
        albumName: albumName,
        social: social,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
  
    // Clear input field
    document.getElementById("searchTerm").reset();
  
  });

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
  
