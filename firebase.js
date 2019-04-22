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

  $(".btn btn-default").on("click", function(event) {
    event.preventDefault();

    var searchByArtist = " ";
    var searchBySong = " ";

    // grabbing user input
    var searchBySong = $("#search-bar-song").val().trim();

    var SearchByArtist = $("#search-bar-artist").val().trim();

    var resultsShow = {
      song: searchBySong,
      artist: searchByArtist,
    };

    database.ref().push(resultsShow);

    console.log(searchBySong.song);
    console.log(searchbyArtist.artist),

    // clearing text box
    $("#search-bar").val("");

    // when the user adds an additional song and artist
    database.ref().on("child_added", function(childSnapshot) {
      console.log(childSnapshot.val());

  });