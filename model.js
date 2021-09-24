const mongoose = require('mongoose');

const MessageTable = mongoose.Schema({
    msgId:{
        type : String,
        required:true,        
    },
    msg:{
        type:String
    },
    username:{
        type:String
    },
    email:{
        type:String
    },
    date:{
        type:Date,
        default : Date.now
    },
    userId:{
        type:Number,
        required:true,
    }
})

module.exports = mongoose.model('messages',MessageTable)