import express from 'express'
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
} from '../controllers/post-controller'
import { authenticateRequest } from '../middlewares/authMiddleware'

const router = express()

router.use(authenticateRequest)

router.post('/create-post', createPost)
router.get('/all-posts', getAllPosts)
router.get('/get-post/:id', getPost)
router.delete('/delete-post/:id', deletePost)

export { router }
