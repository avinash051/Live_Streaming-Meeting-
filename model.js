const mongoose = require('mongoose');

const MessageTable = mongoose.Schema({
    msg_id:{
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
    user_id:{
        type:Number,
        required:true,
    }
})

module.exports = mongoose.model('messagetable',MessageTable)