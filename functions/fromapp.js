const functions = require('firebase-functions');

// onCall Declares a callable method for clients to call using a Firebase SDK.
exports.addMessage = functions.https.onCall((data, ctx) => {
  const text = data.text;

  if (!ctx.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const uid = ctx.auth.uid;
  const {name, picture, email} = ctx.auth.token;

  const obj = {
    text,
    uid,
    name,
    picture,
    email
  };

  return admin.firestore().collection('messages').add(obj);
});
