import mongoose, { type Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  playerName: string
  name?: string
  photoUrl?: string
  age?: number
  country?: string
  position?: string
  height?: string
  jerseyNumber?: number
  team?: string
  winRate?: number
  threePointAccuracy?: number
  comparePassword(candidate: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  playerName: { type: String, required: true, trim: true },
  name: { type: String, trim: true },
  photoUrl: { type: String, trim: true },
  age: { type: Number },
  country: { type: String, trim: true },
  position: { type: String, trim: true },
  height: { type: String, trim: true },
  jerseyNumber: { type: Number },
  team: { type: String, trim: true },
  winRate: { type: Number },
  threePointAccuracy: { type: Number },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)
