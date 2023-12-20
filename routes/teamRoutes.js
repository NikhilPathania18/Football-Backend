import express from 'express'
import { addPlayersInTeam, createTeam, deleteTeam, getAllTeamsList, getPlayersOfTeam, getTeamDetails, updateTeamDetails } from '../controllers/team/teamController.js';
import multer from 'multer'

const router = express.Router();

const upload = multer();

router.post('/create-team', upload.single('logo'), createTeam);

router.put('/add-players/:id', addPlayersInTeam)

router.get('/:id', getTeamDetails)

router.get('/list/all',getAllTeamsList)

router.delete('/delete/:id', deleteTeam)

router.put('/update/:id',upload.single('logo'), updateTeamDetails)

router.get('/player-list/:id', getPlayersOfTeam);

export default router;