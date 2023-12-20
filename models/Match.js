import mongoose, { Schema } from "mongoose";
const matchSchema = new Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'tournament'
    },
    venue: {
        type: String
    },
    matchNumber:{
        type: Number 
    },
    matchName:{
        type: String
    },
    date:{
        type: Date 
    },
    currentStatus:{
        type: String,
        enum: ['notStarted','firstHalf','halfTime','secondHalf','fullTime','extraTimeFirstHalf','extraTimeHalfTime','extraTimeSecondHalf','penalties', 'halfTime', 'fullTime', 'extraTimeHalfTime'],
        default: 'notStarted'
    },
    halfLength:{
        type: Number
    },
    extraTimeHalfLength:{
        type: Number
    },
    firstHalfStartTime:{
        type: Date
    },
    secondHalfStartTime:{
        type: Date
    },
    extraTimeFirstHalfStartTime:{
        type: Date
    },
    extraTimeSecondHalfStartTime:{
        type: Date
    },
    teamA:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team'
    },
    teamB:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team'
    },
    teamAEvents:{
        type: [{
            type:{
                type: String,
                enum: ['goal','yellowCard','redCard','penaltyMissed']
            },
            time:{
                type: String
            },
            player:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'player'
            },
            assist:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'player'
            },
            goalType: {
                type: String,
                enum: ['openPlay', 'penalty' , 'freeKick', 'ownGoal'] 
            },
            remarks:{
                type: String 
            }
        }],
        default: []
    },
    teamBEvents:{
        type: [{
            type:{
                type: String,
                enum: ['goal','yellowCard','redCard','penaltyMissed']
            },
            time:{
                type: String
            },
            player:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'player'
            },
            assist:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'player'
            },
            goalType: {
                type: String,
                enum: ['openPlay', 'penalty' , 'freeKick', 'ownGoal']
            },
            remarks:{
                type: String 
            }
        }],
        default: []
    },
    playersA:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player'
    }],
    playersB:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player'
    }],
    teamAScore:{
        type: Number,
        default: 0
    },
    teamBScore:{
        type: Number,
        default: 0
    },
    teamAPenalties:{
        type: Number
    },
    teamBPenalties:{
        type: Number
    },
    status:{
        type: String,
        enum:['upcoming','ongoing','ended'],
        default: 'upcoming'
    },
    winner:{
        type: String,
        default: 'draw'
    },
    isKnockout:{
        type:Boolean,
        default: false
    },
    playersPlayedA:{
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'player'
        }],
        default: []
    },
    playersPlayedB:{
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'player'
        }],
        default: []
    },
    startingElevenA:{
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'player'
        }],
        default: []
    },
    startingElevenB:{
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'player'
        }],
        default: []
    },
    time: {
        type: String,
        default: "5:00 PM"
    }
})

const match = mongoose.model('match', matchSchema);

export default match;