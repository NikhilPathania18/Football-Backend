import express from 'express'
import { addPlayersInTeam, createTeam, deleteTeam, getAllTeamsList, getLatestTournamentTeams, getPlayersOfTeam, getTeamDetails, updateTeamDetails } from '../controllers/team/teamController.js';
import multer from 'multer'

const router = express.Router();

const upload = multer();

router.post('/create-team', upload.single('logo'), createTeam);

router.get('/latest-tournament-teams', getLatestTournamentTeams)

router.put('/add-players/:id', addPlayersInTeam)

router.get('/list/all',getAllTeamsList)

router.delete('/delete/:id', deleteTeam)

router.put('/update/:id',upload.single('logo'), updateTeamDetails)

router.get('/player-list/:id', getPlayersOfTeam);

router.get('/:id', getTeamDetails)

export default router;