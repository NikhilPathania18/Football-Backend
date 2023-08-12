import express from "express";
import {
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getPlayerDetails,
  updatePlayer,
} from "../controllers/player/playerController.js";
import multer from "multer";

const upload = multer();
const router = express.Router();

router.post("/create-player", upload.single('photo'), createPlayer);

router.put("/update-player/:id", upload.single('photo'), updatePlayer);

router.get('/:id', getPlayerDetails)

router.get('/list/:branchYear', getAllPlayers)

router.delete('/delete/:id', deletePlayer);

export default router;
