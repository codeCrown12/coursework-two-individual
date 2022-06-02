// Initialize express application
const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors');
const app = express()


// Create a database connection
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const url = "mongodb+srv://dbschoolhero:uJkTKLFBLIHB06xE@testcluster.l7oe0.mongodb.net/schoolherodb?retryWrites=true&w=majority";
let db
MongoClient.connect(url, (err, client) => {
    if (err){
        console.log(err)
    }
    db = client.db()
})

app.use(express.json())
app.use(cors());

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

// Logging middleware
app.use(function(req, res, next){
    console.log("Request type: "+req.method)
    console.log("Request url: "+req.url)
    console.log("Request date: "+new Date())
    console.log("Request IP: "+req.ip)
    next()
})

app.get('/', (req, res, next) => {
    res.send('Entry point URL')
})

// Retrieve all lessons
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((err, results) => {
        if (err) return next(err)
        res.send(results)
    })
})

// Update lesson spaces
app.put('/collection/:collectionName', (req, res, next) => {
    req.body.forEach((item) => {
        let filter = { _id: new ObjectID(item.id) }
        let new_value = { $set: {spaces: item.spaces} }
        let options = { safe: true, multi: false }
        req.collection.updateOne(filter, new_value, options, (err, result) => {
            if (err) return next(err)
        })
    });
    res.send({msg: "spaces successfully updated"})
})


// Add new order
app.post("/collection/:collectionName", (req, res, next) => {
    let doc = req.body
    db.collection('orders').insertOne(doc, (err, result) => {
        if (err) return next(err)
        res.send({msg: "order added successfully"})
    })
}) 


// Key up search
app.get("/collection/:collectionName/search", (req, res, next) => {
    let regex = new RegExp(req.query.filter,"i")
    let filter = {$or: [{title: regex}, {location: regex}]}
    db.collection('activities').find(filter).toArray((err, results) => {
        if (err) return next(err)
        res.send(results)
    })
})


// Static file middleware
app.use(function(req, res, next){
    var filePath = path.join(__dirname, "static", req.url)
    fs.stat(filePath, function(err, fileInfo){
        if (err) {
            next()
            return
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath)
        }
        else{
            next()
        }
    })
})

app.use(function(req, res){
    res.status(404)
    res.send("file not found")
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("Running on port 3000")
})
