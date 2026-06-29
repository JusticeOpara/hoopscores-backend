import { Router } from 'express'
import { User } from '../models/User.js'
import { generateToken } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { email, password, playerName } = req.body
    if (!email || !password || !playerName) {
      res.status(400).json({ error: 'Email, password, and player name are required' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    const existing = await User.findOne({ email })
    if (existing) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }

    const user = await User.create({ email, password, playerName })
    const token = generateToken(user._id.toString())
    res.status(201).json({ token, user: { id: user._id.toString(), email: user.email, playerName: user.playerName } })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const token = generateToken(user._id.toString())
    res.json({ token, user: { id: user._id.toString(), email: user.email, playerName: user.playerName } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
