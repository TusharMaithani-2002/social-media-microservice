import express from 'express'
import {
  loginUser,
  logoutUser,
  refreshTokenUser,
  registerUser,
} from '../controllers/identity-controller'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/refresh-token', refreshTokenUser)
router.post('/logout', logoutUser)

export { router }
