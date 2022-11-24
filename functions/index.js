const functions = require("firebase-functions");

const admin = require('firebase-admin');
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const express = require('express');
const cors = require('cors');
const { response } = require("express");
const { makeDataSnapshot } = require("firebase-functions-test/lib/providers/database");

const app = express();
app.use(cors({origin: true}));

//main db ref
const db = admin.firestore();

//routes
app.get('/', (req, res) => {
    return res.status(200).send('heloo')
});

//create post()
app.post('/api/create', (req, res) => {
    (async () => {
        try {
            await db.collection('userDetails').doc(`/${Date.now()}/`).create({
                id : Date.now(),
                name : req.body.name,
                mobile : req.body.mobile,
                address : req.body.address
            });
            return res.status(200).send({status : "success", msg: "data saved"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status : "failed", msg: error});
        }
    })();
});
//get get() -- single data
app.get('/api/get/:id', (req, res) => {
    (async () => {
        try {
            //load doc -- no data tho
            const reqDoc = db.collection('userDetails').doc(req.params.id);
            //fetch doc
            let userDetail = await reqDoc.get();
            //get data from doc
            let response = userDetail.data();
            return res.status(200).send({status : "success", data: response});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status : "failed", msg: error});
        }
    })();
});
//fetch all details
app.get('/api/getAll', (req, res) => {
    (async () => {
        try {
            const query = db.collection('userDetails');
            let response = [];
            await query.get().then((data) => {
                let docs = data.docs;
                //read each item
                docs.map((doc) => {
                    //create the item
                    const selectedItem = {
                        name : doc.data().name,
                        mobile : doc.data().mobile,
                        address : doc.data().address
                    };
                    //push to array of response obj
                    response.push(selectedItem);
                });
                return response;
            });

            return res.status(200).send({status : "success", data: response});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status : "failed", msg: error});
        }
    })();
});
//update put()
app.put('/api/update/:id', (req, res) => {
    (async () => {
        try {
            //ref to doc
            const reqDoc = db.collection('userDetails').doc(req.params.id);
            await reqDoc.update({
                name : req.body.name,
                mobile : req.body.mobile,
                address : req.body.address
            });
            return res.status(200).send({status : "success", msg: "data updated"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status : "failed", msg: error});
        }
    })();
});
//delete delete()
app.delete('/api/delete/:id', (req, res) => {
    (async () => {
        try {
            //ref to doc
            const reqDoc = db.collection('userDetails').doc(req.params.id);
            await reqDoc.delete();
        
            return res.status(200).send({status : "success", msg: "data removed"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status : "failed", msg: error});
        }
    })();
});
//export api to firebase 
exports.app = functions.https.onRequest(app);

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
