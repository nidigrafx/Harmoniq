// Initialize Firebase
var config = {
  apiKey: "AIzaSyButBMTK9NxMSyqJPNVvIoxyBgYmMMu0qs",
  authDomain: "harmoniq.firebaseapp.com",
  databaseURL: "https://harmoniq.firebaseio.com",
  projectId: "harmoniq",
  storageBucket: "harmoniq.appspot.com",
  messagingSenderId: "604012143278"
};
firebase.initializeApp(config);

// search through the input to find the song name and the artist (needs to go through twice)
// all the data will be present in the JSON object, firebase needs to record just the song name and the artist. 

var database = firebase.database();
// ==========
// globals
// ==========

// used in firebase updates/pulls
var searchBySong = [];
var searchByArtist = [];
var dbRecordCount = 0;

// used for firebase updates and deletes
var keyId;
var savedRow;
var deletedRow;
var searchedSong;
var searchedArtist;

// on click button to push data to realtime firebase database
$(".btn btn-default").on("click", function(event) {
  event.preventDefault();

  // grabbing user input
  var searchBySong = $("#songName").val().trim();
  var searchByArtist = $("#artistName").val().trim();

  var resultsShow = { 
    song: searchBySong,
    artist: searchByArtist,
  };

  database.ref().push(resultsShow);

  console.log(searchBySong.song);
  console.log(searchbyArtist.artist);

// clearing text box
   $("#search-bar").val("");

// when the user adds an additional song and artist
   database.ref().on("child_added", function(childSnapshot) {
     console.log(childSnapshot.val());

   searchBySong = childSnapShot.val().song;
   searchByArtist = childSnapshot.val().artist;

   });

// updating specific fields without overwriting previous childs

   var keyId = childSnapshot.key;
   console.log ("keyId", keyId);

});

  searchBySong.push({ record: dbRecordCount,
      song: searchBySong,
      artist: searchByArtist,
  });

dbRecordCount++;

// saving updates to realtime database

editFirebase = function () {
  searchBySong = searchedSong;
  searchByArtist = searchedArtist;

  
}

});
Collapse




