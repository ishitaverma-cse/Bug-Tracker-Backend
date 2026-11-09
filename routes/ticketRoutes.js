import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'

import {
    createTicket,
    getTicketsByProject,
    updateTicket,
    deleteTicket,
    assignTicket,
} from '../controllers/ticketController.js'

const router = express.Router()

// Protect all Ticket Routes
router.use(authMiddleware)

// Create Ticket
router.post('/', createTicket)

// Get Tickets By Project
router.get('/project/:projectId', getTicketsByProject)

// Update Ticket
router.put('/:id', updateTicket)

// Delete Ticket
router.delete('/:id', deleteTicket)

// Assign Ticket
router.patch('/:id/assign', assignTicket)

export default router
