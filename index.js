// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
require("firebase/functions");


async function signUp(email, password) {
  const result = await firebase.auth().createUserWithEmailAndPassword(email, password);

  return result;
}

async function signIn(email, password) {
  const result = await firebase.auth().signInWithEmailAndPassword(email, password);

  return result;
}

async function addDoc(db, collection, obj) {
  const result = await db.collection(collection).add(obj);

  return result
}

async function getDoc(db, collection) {
  const result = db.collection(collection).get();

  return result;
}

async function likeIt(db, collection, docId, userId) {
  const doc = await db.collection(collection).doc(docId);

  // const path = `likuito.${userId}`;
  // await doc.update({
  //   [path]: true
  // });

  return await doc.update({
    likes: firebase.firestore.FieldValue.arrayUnion(userId)
  });
}

async function dislikeIt(db, collection, docId, userId) {
  const doc = await db.collection(collection).doc(docId);

  return await doc.update({
    likes: firebase.firestore.FieldValue.arrayRemove(userId)
  });
}

(async () => {
  const  firebaseConfig = {
    apiKey: "AIzaSyBNo-v5uAFdtufW3Tn_ZLGs-BFc4b0_19k",
    authDomain: "idke-d521d.firebaseapp.com",
    databaseURL: "https://idke-d521d.firebaseio.com",
    projectId: "idke-d521d",
    storageBucket: "idke-d521d.appspot.com",
    messagingSenderId: "855338117142",
    appId: "1:855338117142:web:628d8956919e85684f2d37"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const functions = firebase.functions();


  const email = ""
  const password = ""

  const {user} = await signIn(email, password);
  console.log({user});
  const getData = functions.httpsCallable('getData');

  const res = await getData({text: 'Some shity text <script>alert();</script> here'});
  return res.data.text;
  // const res = await addDoc(db, "users", {
  //     first: "First",
  //     last: "Last",
  //     born: 1942
  // })
  // return res.id;

  // const col = await getDoc(db, "users")
  // return col;

  // const l = await likeIt(db, "ideas", "giZ544ejUBR0Iu1k4jsq", user.uid);
  // console.log("like", l);

  // const d = await dislikeIt(db, "ideas", "giZ544ejUBR0Iu1k4jsq", user.uid);
  // console.log("dislike", d);
})()
  .then(x => {
    console.log("ok", x);
    // x.forEach(doc => {
    //   console.log(`${doc.id} => ${doc.data()}`);
    // });
  })
  .catch(function(error) {
    console.log(`err: code: ${error.code}, msg: ${error.message}`);
  });

