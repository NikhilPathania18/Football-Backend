import express from 'express'
import { deleteNews, getNewsById, getTopNews, newNews, setMainNews } from '../controllers/news/newsController.js';
import multer from 'multer'
const router = express.Router();
const upload = multer();


router.post('/new-news',upload.single('image'),newNews);

router.delete('/:id',deleteNews)

router.get('/', getTopNews)

router.get('/:id', getNewsById)
router.post('/main-news/:id', setMainNews)

export default router