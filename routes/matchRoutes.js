import express from 'express'
import { addPenalty, deleteMatch, endHalf, endMatch, getLatestTournamentMatches, getMatchDetails, getMatchesList, newMatch, removePenalty, startHalf, updateEvent, updateScore, updateStatus, updateWholeMatch } from '../controllers/match/matchControllers.js';

const router = express.Router();

router.post('/new-match', newMatch)

router.put('/end-match/:id', endMatch)

router.put('/update-score/:id' , updateScore)

router.put('/update-match/:id', updateWholeMatch)

router.put('/add-event/:id', updateEvent)

router.put('/update-status/:id', updateStatus)

router.put('/start-half/:id', startHalf)

router.put('/end-half/:id', endHalf)

router.get('/details/:id', getMatchDetails)

router.get('/list/:status', getMatchesList)

router.delete('/delete/:id', deleteMatch)

router.get('/latest-tournament-matches', getLatestTournamentMatches)

router.put('/add-penalty/:id', addPenalty)

router.put('/remove-penalty/:id', removePenalty)


export default router;