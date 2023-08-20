import mongoose, { Schema } from "mongoose";

const tournamentSchema = new Schema({
    type:{
        type: String,
        enum: ['interyear', 'interbranch', 'friendly', 'other']
    },
    startYear:{
        type: Number,
        required: true
    },
    endYear:{
        type: Number
    },
    name:{
        type: String
    },
    schedule:{
        type: String 
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team'
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'match'
    }],
    winner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'team'
    },
    runnerUp:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team'
    },
    status:{
        type: String,
        enum: ['upcoming','ongoing','ended'],
        default: 'upcoming'
    },
    numberOfGroups:{
        type: Number,
        default: 1
    },
    pointsTable:[{
        groupName:{
            type: String
        },
        teamStats:[{
            team:{
                type: mongoose.Schema.Types.ObjectId
            },
            matches:{
                type: Number,
                default: 0
            },
            wins:{
                type: Number,
                default: 0
            },
            loses:{
                type: Number,
                default: 0
            },
            draws: {
                type: Number,
                default: 0
            },
            goalsScored: {
                type: Number,
                default: 0
            },
            goalsConceeded:{
                type: Number,
                default: 0
            },
            yellowCards:{
                type: Number,
                default: 0
            }
        }]
        

    }]
})

const tournament = mongoose.model('tournament', tournamentSchema)

export default tournament;