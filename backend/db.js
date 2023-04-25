const mongoose = require('mongoose');

function connect (){
mongoose.connect("mongodb://127.0.0.1:27017/inotebook").then(
    console.log(`connected`)
    )
}
module.exports = connect;