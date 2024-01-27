import express from 'express'
import { deleteNews, getAllNews, getNewsById, getTopNews, newNews, setMainNews } from '../controllers/news/newsController.js';
import multer from 'multer'
const router = express.Router();
const upload = multer();


router.post('/new-news',upload.single('image'),newNews);

router.get('/all', getAllNews)

router.get('/', getTopNews)

router.get('/:id', getNewsById)
router.delete('/:id',deleteNews)
router.post('/main-news/:id', setMainNews)


export default router