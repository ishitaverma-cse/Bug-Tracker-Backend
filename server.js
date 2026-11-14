import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import ticketRoutes from './routes/ticketRoutes.js'
import commentRoutes from './routes/commentRoutes.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Authentication Routes
app.use('/api/auth', authRoutes)

// Project Management Routes
app.use('/api/projects', projectRoutes)

// Ticket Management Routes
app.use('/api/tickets', ticketRoutes)

// Comment Management Routes
app.use('/api/comments', commentRoutes)

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