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
        title:{
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
            win:{
                type: Number,
                default: 0
            },
            lost:{
                type: Number,
                default: 0
            },
            draw: {
                type: Number,
                default: 0
            },
            gf: {
                type: Number,
                default: 0
            },
            ga:{
                type: Number,
                default: 0
            },
            yellowCards:{
                type: Number,
                default: 0
            },
            points:{
                type: Number,
                default: 0
            }
        }]
    }],
    numberOfGoals:{
        type: Number,
        default: 0
    },
    numberOfMatches:{
        type: Number,
        default: 0
    },
    mostGoals:{
        type: Map
    },
    mostAssists:{
        type: Map
    }
})

const tournament = mongoose.model('tournament', tournamentSchema)

export default tournament;