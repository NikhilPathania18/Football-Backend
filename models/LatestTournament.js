import mongoose,{ Schema } from "mongoose";
import tournament from './Tournament.js';

const latestTournamentSchema = new Schema({
    tournament:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tournament'
    }
})

const latestTournament = mongoose.model('latestTournament',latestTournamentSchema)

export default latestTournament