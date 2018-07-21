importScripts('https://www.gstatic.com/firebasejs/5.0.4/firebase.js');
// Initialize Firebase
var config = {
    apiKey: "AIzaSyBvXN9yO7XppI5GZmAfXFdqVQQ414lLL3Y",
    authDomain: "olx-pwa.firebaseapp.com",
    databaseURL: "https://olx-pwa.firebaseio.com",
    projectId: "olx-pwa",
    storageBucket: "olx-pwa.appspot.com",
    messagingSenderId: "648455976904"
};

firebase.initializeApp(config);

// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();
