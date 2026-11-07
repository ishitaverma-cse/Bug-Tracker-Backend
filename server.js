import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Authentication Routes
app.use('/api/auth', authRoutes)

// Test Route
app.get('/', (req, res) => {
    res.send('Resolveon Backend is running successfully! 🚀')
})

// MongoDB Connection
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully! 🗄️')

        app.listen(PORT, () => {
            console.log(`Resolveon server is running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message)
    })