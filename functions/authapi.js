'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Follow instructions to set up admin credentials:
// https://firebase.google.com/docs/functions/local-emulator#set_up_admin_credentials_optional
admin.initializeApp();

const express = require('express');
const cors = require('cors'); // TODO: make cors better
const app = express();

async function authenticate(req, res, next) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }

  const idToken = req.headers.authorization.split('Bearer ')[1];

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    res.status(403).send('Unauthorized');
    return;
  }
}

async function auth(req, res, next) {
  req.user = {uid: "someUserID"}
  next();
}

app.use(auth);
app.use(cors());

app.post('/api/ideas', async (req, res) => {
	const {title, description} = req.body;
  if (title == undefined || description == undefined) {
		return res.status(403).json({result: "error", error: {message: "no title or description"}});
  }

	const uid = req.user.uid;

  const data = {
    uid,
    description,
    title,
    likes: 0,
    likers: [],
    createdAt: Date.now()
	};

	try {
		await admin.firestore()
			.collection("ideas").add(data);

		return res.status(201).json({result: "ok"});
	} catch(error) {
		console.log('Cannot add Idea', error.message);
		return res.sendStatus(500);
	}
});

// GET /api/ideas?from={doc}&limit={limit}
// TODO: do we need to use http to get data from firestore or SDK is better way?
app.get('/api/ideas', async (req, res) => {
  const {from, limit = 20, order = 'desc'} = req.query;
  let query = admin.firestore().collection("ideas").orderBy("createdAt", order).limit(+limit);

  if (from !== undefined) {
    // TODO: not optimal?
    const doc = await admin.firestore().collection("ideas").doc(from).get();
    query = query.startAfter(doc);
  }

  try {
    const snapshot = await query.get();
    let ideas = [];

    snapshot.forEach((childSnapshot) => {
      ideas.push(Object.assign({id: childSnapshot.id}, childSnapshot.data()));
    });

    if (ideas.length === 0) {
      return res.status(200).json({items: ideas});
    }

    // Get the last page document
    const last = snapshot.docs[snapshot.docs.length - 1];
    const next = new URL('http://localhost:5001' + req.originalUrl);
    next.searchParams.append('from', last.id);

    const stats = await admin.firestore().collection('meta').doc('stats').get();

    const result = {
      total: stats.data().ideasCreated,
      nextpage: next.href,
      items: ideas,
    }

    return res.status(200).json(result);
  } catch(error) {
    console.log('Error getting messages', error.message);
    return res.sendStatus(500);
  }
});

// GET /api/ideas/{ideaId}
app.get('/api/ideas/:ideaId', async (req, res) => {
  const ideaId = req.params.ideaId;
	const uid = req.user.uid;

  try {
    const doc = await admin.firestore().collection("ideas").doc(ideaId).get();

    return res.status(200).json(doc.data());
  } catch(err) {
    console.log('error', err.message);
    return res.sendStatus(500);
  }
});

// PUT /api/ideas/{ideaId}/like
app.put('/api/ideas/:ideaId/likes', async (req, res) => {
  const ideaId = req.params.ideaId;
  console.log(`Like for ${ideaId}`);
	const uid = req.user.uid;

  try {
    let query = admin.firestore().collection("ideas").doc(ideaId);
    query.update({
      likers: admin.firestore.FieldValue.arrayUnion(uid),
    });

    return res.status(200).json({result: 'ok'});
  } catch(err) {
    console.log('error', err.message);
    return res.sendStatus(500);
  }
});

// DELETE /api/ideas/{ideaId}/like
app.delete('/api/ideas/:ideaId/likes', async (req, res) => {
  const ideaId = req.params.ideaId;
  console.log(`Dislike for ${ideaId}`);
	const uid = req.user.uid;

  try {
    let query = admin.firestore().collection("ideas").doc(ideaId);
    query.update({
      likers: admin.firestore.FieldValue.arrayRemove(uid),
    });

    return res.status(200).json({result: 'ok'});
  } catch(err) {
    console.log('error', err.message);
    return res.sendStatus(500);
  }
});

// Expose the API as a function
exports.api = functions.https.onRequest(app);
