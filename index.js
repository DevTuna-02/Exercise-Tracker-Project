const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const uri = 'mongodb+srv://ShadyRoombot:Unsichtbar312617@cluster0.geecjez.mongodb.net/exerciseTracker?retryWrites=true&w=majority'
require('dotenv').config()
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(cors())
app.use(express.static('public'))

// for parsing application/json
app.use(express.json()); 

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let userSchema= new mongoose.Schema({
  username:{ type:String,
             required:true},
  log: [{
    description: { type:String,
      required:true},
    duration: { type:Number,
      required:true},
    date: { type:Date,
      required:true},
  }]
});

let userLog = new mongoose.model('userData',userSchema);

app.post('/api/users/:_id/exercises',(req,res)=>{
  if(req.body.description&&req.body.duration){
    userLog.findById(req.params['_id'])
           .then(doc=>{
            doc.log.push({
          description:req.body.description,
          duration:req.body.duration,
          date:req.body.date?req.body.date:new Date()
        })
        doc.save().then(user=>res.json({
          "_id": user['_id'],
          "username": user.username,
          "date": user.log[user.log.length-1].date,
          "duration": user.log[user.log.length-1].duration,
          "description": user.log[user.log.length-1].description
      }))
           })
           .catch(err=>console.error(err))
        
        
      }
    })

    app.get('/api/users/:_id/logs',(req,res)=>{
      userLog.findById(req.params['_id'])
           .then(doc=>res.json({...doc['_doc'],count:doc['_doc'].log.length}))
    })



app.post('/api/users',(req,res)=>{
  if(req.body.username){
    userLog({
      username:req.body.username
    }).save().then(data=>{
      res.json({
        username:data.username,
        _id:data['_id']
      })
    }).catch(err=>console.error(err))
  }
})

app.get('/api/users',(req,res)=>{
  userLog.find({}).then(users=>{
    res.json(users)
  }).catch(err=>{
    console.error(err)
  });
  
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
