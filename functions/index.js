const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
// const admin = require('firebase-admin');
// admin.initializeApp();

// Handle HTTP requests
// exports.http = require('./fromhttp.js');

// some db event handlers
exports.evt = require('./dbevents.js');

// http api
exports.api = require('./authapi.js');
