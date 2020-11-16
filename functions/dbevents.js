const functions = require('firebase-functions');
const admin = require('firebase-admin');

// update likes count on idea modification
exports.refreshLikes = functions.firestore.document('/ideas/{ideaId}').onUpdate((change, ctx) => {
  const newVal = change.after.data();
  const prev = change.before.data();

  if (newVal.likers.length > prev.likers.length) {
    return change.after.ref.update({
      likes: admin.firestore.FieldValue.increment(1)
    })
  }

  if (newVal.likers.length < prev.likers.length) {
    return change.after.ref.update({
      likes: admin.firestore.FieldValue.increment(-1)
    })
  }

  return null;
});

exports.refreshIdeasCount = functions.firestore.document('/ideas/{ideaId}').onCreate((snap, context) => {
  // const newValue = snap.data();

  return admin.firestore().collection('meta').doc('stats').update({
    ideasCreated: admin.firestore.FieldValue.increment(1)
  });
});

