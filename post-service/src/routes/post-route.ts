import mongoose from 'mongoose'
import express from 'express'
import { createPost } from '../controllers/post-controller'
import { authenticateRequest } from '../middlewares/authMiddleware'

const router = express()

router.use(authenticateRequest)

router.post('/create-post', createPost)

export { router }
