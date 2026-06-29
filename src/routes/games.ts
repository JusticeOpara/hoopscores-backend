import { Router } from 'express'
import mongoose from 'mongoose'
import { Game } from '../models/Game.js'
import { requireAuth } from '../middleware/auth.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const authReq = req as AuthRequest
    const games = await Game.find({ userId: new mongoose.Types.ObjectId(authReq.userId) })
      .sort({ timestamp: -1 })
      .lean()
    res.json(games.map(g => ({ ...g, id: g._id })))
  } catch (err) {
    console.error('Get games error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const authReq = req as AuthRequest
    const { id, date, time, timestamp, player1, score1, player2, score2, note, overtime } = req.body

    if (!id || !date || !time || timestamp == null || !player1 || score1 == null || !player2 || score2 == null) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const game = await Game.findByIdAndUpdate(
      id,
      {
        _id: id,
        userId: new mongoose.Types.ObjectId(authReq.userId),
        date, time, timestamp,
        player1, score1, player2, score2,
        note: note || '',
        overtime: !!overtime,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    res.status(201).json({ ...game, id: game!._id })
  } catch (err) {
    console.error('Create game error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/sync', async (req, res) => {
  try {
    const authReq = req as AuthRequest
    const { games } = req.body
    if (!Array.isArray(games)) {
      res.status(400).json({ error: 'games array is required' })
      return
    }

    const userId = new mongoose.Types.ObjectId(authReq.userId)
    const ops = games.map((g: any) => ({
      updateOne: {
        filter: { _id: g.id },
        update: {
          $set: {
            _id: g.id,
            userId,
            date: g.date,
            time: g.time,
            timestamp: g.timestamp,
            player1: g.player1,
            score1: g.score1,
            player2: g.player2,
            score2: g.score2,
            note: g.note || '',
            overtime: !!g.overtime,
          },
        },
        upsert: true,
      },
    }))

    await Game.bulkWrite(ops)

    const allGames = await Game.find({ userId })
      .sort({ timestamp: -1 })
      .lean()

    res.json(allGames.map(g => ({ ...g, id: g._id })))
  } catch (err) {
    console.error('Sync games error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const authReq = req as AuthRequest
    const game = await Game.findOneAndDelete({ _id: req.params.id, userId: new mongoose.Types.ObjectId(authReq.userId) })
    if (!game) {
      res.status(404).json({ error: 'Game not found' })
      return
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Delete game error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
