import express from 'express'
import { addTeams, changeTournamentStatus, createTournament, getLatestTournament, getMatchesList, getTeamList, getTournamentDetails, getTournaments, putTeamsInGroup, setLatestTournament, updateTournamentDetails } from '../controllers/tournament/tournamentController.js';

const router = express.Router();

router.post('/new', createTournament)

router.put('/add-teams/:id', addTeams)

router.put('/change-status/:id', changeTournamentStatus)

router.put('/update-tournament/:id', updateTournamentDetails)

router.get('/details/:id', getTournamentDetails)

router.get('/list/:status', getTournaments)

router.get('/matches-list/:id', getMatchesList)

router.get('/teams-list/:id', getTeamList)

router.post('/set-latest-tournament/:id',setLatestTournament)

router.get('/get-latest-tournament', getLatestTournament)

router.put('/put-teams-in-group', putTeamsInGroup)

router.get('/latest-tournament-details')
export default router;
