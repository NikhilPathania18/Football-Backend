import latestTournament from "../models/LatestTournament.js";

export const getLatestTournamentId = async() => {
    try {
        const tournament = await latestTournament.find({})

        if(tournament.length===0)   return false;

        return tournament[0].tournament;
    } catch (error) {
        console.log(error) 
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        })
    }
}