import express from "express";
import {
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getPlayerDetails,
  getPlayersWithMostAssists,
  getPlayersWithMostGoals,
  getPlayersWithMostRedCards,
  getPlayersWithMostYellowCards,
  updatePlayer,
} from "../controllers/player/playerController.js";
import multer from "multer";

const upload = multer();
const router = express.Router();

router.post("/create-player", upload.single('photo'), createPlayer);

router.put("/update-player/:id", upload.single('photo'), updatePlayer);


router.get('/list/:branchYear', getAllPlayers)

router.delete('/delete/:id', deletePlayer);

router.get('/most-goals', getPlayersWithMostGoals)

router.get('/most-assists', getPlayersWithMostAssists)

router.get('/most-yellow-cards', getPlayersWithMostYellowCards)

router.get('/most-red-cards', getPlayersWithMostRedCards)

router.get('/:id', getPlayerDetails)
export default router;
