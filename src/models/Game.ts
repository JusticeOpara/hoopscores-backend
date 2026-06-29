import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  timestamp: { type: Number, required: true },
  player1: { type: String, required: true },
  score1: { type: Number, required: true },
  player2: { type: String, required: true },
  score2: { type: Number, required: true },
  note: { type: String, default: '' },
  overtime: { type: Boolean, default: false },
}, { _id: false, timestamps: true })

gameSchema.index({ userId: 1, timestamp: -1 })

export const Game = mongoose.model('Game', gameSchema)
