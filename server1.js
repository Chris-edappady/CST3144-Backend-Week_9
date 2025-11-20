const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
let db;
 
app.use(express.json());
// app.set('port', 3000);
 
app.use ((request,response,next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
 
    next();
});
 
//use mongodb username
MongoClient.connect(('mongodb+srv://ce509:zn60iIQGQCibasri@cluster0.zhq0t.mongodb.net'), (err, client) => {
    db = client.db('webstore')
})
 
//display a messsage for root path to show that API is working
app.get('/',(req,res,next)  =>  {
    res.send('Select a collection, e.g., /collection/messages')
})
 
// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    //console.log('collection name:', req.collection)
    return  next()
})
 
//retrieve all the objects from a collection
app.get('/collection/:collectionName', (req,res,next)  =>   {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})
 
 
//adding post
app.post('/collection/:collectionName', (req, res, next) =>  {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops)
    })
})
//returns with object id

const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id:new ObjectID(req.params.id)}, (e,result) =>{
      if (e) return next (e)
        res.send(result)
    });
  }); 

app.put('/collection/:collectionName/:id', (req, res, next) => {
  req.collection.updateOne(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    { safe: true, multi: true },
    (e, result) => {
      if (e) return next(e)
      res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
    });
});

app.delete('/collection/:collectionName/:id', (req, res, next) => {
  req.collection.deleteOne(
    { _id: ObjectID(req.params.id) }, (e, result) => {
      if (e) return next(e);
      res.send(result.deletedCount === 1) ? 
      { msg: 'success' } : { msg: 'error' }    
    })
})

const port = process.env.PORT || 3000;

app.listen(port);
