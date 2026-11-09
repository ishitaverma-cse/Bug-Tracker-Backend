import mongoose from 'mongoose'
import Ticket from '../models/Ticket.js'
import Project from '../models/Project.js'
import User from '../models/User.js'

// Helper: Check Project Access
const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findById(projectId)

    if (!project) {
        return { project: null, authorized: false }
    }

    const isOwner = project.owner.toString() === userId.toString()

    const isTeamMember = project.teamMembers.some(
        (memberId) => memberId.toString() === userId.toString()
    )

    return {
        project,
        authorized: isOwner || isTeamMember,
    }
}

// Create Ticket
export const createTicket = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            status,
            assignee,
            projectId,
        } = req.body

        if (!title || !title.trim() || !description || !description.trim()) {
            return res.status(400).json({
                message: 'Title and description are required',
            })
        }

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                message: 'A valid project ID is required',
            })
        }

        const { project, authorized } = await checkProjectAccess(
            projectId,
            req.user.id
        )

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            })
        }

        if (!authorized) {
            return res.status(403).json({
                message: 'You are not authorized to access this project',
            })
        }

        // Validate priority
        if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
            return res.status(400).json({
                message: 'Invalid priority',
            })
        }

        // Validate status
        if (
            status &&
            !['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)
        ) {
            return res.status(400).json({
                message: 'Invalid status',
            })
        }

        // Validate assignee if provided
        if (assignee) {
            if (!mongoose.Types.ObjectId.isValid(assignee)) {
                return res.status(400).json({
                    message: 'Invalid assignee ID',
                })
            }

            const isAssigneeMember =
                project.owner.toString() === assignee.toString() ||
                project.teamMembers.some(
                    (memberId) => memberId.toString() === assignee.toString()
                )

            if (!isAssigneeMember) {
                return res.status(400).json({
                    message: 'Assignee must belong to the project',
                })
            }
        }

        const ticket = await Ticket.create({
            title: title.trim(),
            description: description.trim(),
            priority,
            status,
            assignee: assignee || null,
            projectId,
        })

        await ticket.populate('assignee', 'name email')

        res.status(201).json({
            message: 'Ticket created successfully',
            ticket,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to create ticket',
            error: error.message,
        })
    }
}

// Get Tickets By Project
export const getTicketsByProject = async (req, res) => {
    try {
        const { projectId } = req.params

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                message: 'Invalid project ID',
            })
        }

        const { project, authorized } = await checkProjectAccess(
            projectId,
            req.user.id
        )

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            })
        }

        if (!authorized) {
            return res.status(403).json({
                message: 'You are not authorized to access this project',
            })
        }

        const tickets = await Ticket.find({ projectId })
            .populate('assignee', 'name email')
            .populate('projectId', 'title')
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: 'Tickets fetched successfully',
            tickets,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch tickets',
            error: error.message,
        })
    }
}

// Update Ticket
export const updateTicket = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, priority, status } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid ticket ID',
            })
        }

        const ticket = await Ticket.findById(id)

        if (!ticket) {
            return res.status(404).json({
                message: 'Ticket not found',
            })
        }

        const { project, authorized } = await checkProjectAccess(
            ticket.projectId,
            req.user.id
        )

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            })
        }

        if (!authorized) {
            return res.status(403).json({
                message: 'You are not authorized to update this ticket',
            })
        }

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message: 'Ticket title cannot be empty',
                })
            }

            ticket.title = title.trim()
        }

        if (description !== undefined) {
            if (!description.trim()) {
                return res.status(400).json({
                    message: 'Ticket description cannot be empty',
                })
            }

            ticket.description = description.trim()
        }

        if (priority !== undefined) {
            if (!['Low', 'Medium', 'High'].includes(priority)) {
                return res.status(400).json({
                    message: 'Invalid priority',
                })
            }

            ticket.priority = priority
        }

        if (status !== undefined) {
            if (
                !['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)
            ) {
                return res.status(400).json({
                    message: 'Invalid status',
                })
            }

            ticket.status = status
        }

        await ticket.save()
        await ticket.populate('assignee', 'name email')

        res.status(200).json({
            message: 'Ticket updated successfully',
            ticket,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update ticket',
            error: error.message,
        })
    }
}

// Delete Ticket
export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid ticket ID',
            })
        }

        const ticket = await Ticket.findById(id)

        if (!ticket) {
            return res.status(404).json({
                message: 'Ticket not found',
            })
        }

        const { project, authorized } = await checkProjectAccess(
            ticket.projectId,
            req.user.id
        )

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            })
        }

        if (!authorized) {
            return res.status(403).json({
                message: 'You are not authorized to delete this ticket',
            })
        }

        await Ticket.findByIdAndDelete(id)

        res.status(200).json({
            message: 'Ticket deleted successfully',
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete ticket',
            error: error.message,
        })
    }
}

// Assign Ticket
export const assignTicket = async (req, res) => {
    try {
        const { id } = req.params
        const { assigneeId } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid ticket ID',
            })
        }

        const ticket = await Ticket.findById(id)

        if (!ticket) {
            return res.status(404).json({
                message: 'Ticket not found',
            })
        }

        const { project, authorized } = await checkProjectAccess(
            ticket.projectId,
            req.user.id
        )

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            })
        }

        if (!authorized) {
            return res.status(403).json({
                message: 'You are not authorized to assign this ticket',
            })
        }

        // Allow unassigning a ticket
        if (assigneeId === null || assigneeId === '') {
            ticket.assignee = null
        } else {
            if (!assigneeId || !mongoose.Types.ObjectId.isValid(assigneeId)) {
                return res.status(400).json({
                    message: 'A valid assignee ID is required',
                })
            }

            const user = await User.findById(assigneeId)

            if (!user) {
                return res.status(404).json({
                    message: 'Assignee not found',
                })
            }

            const isAssigneeMember =
                project.owner.toString() === user._id.toString() ||
                project.teamMembers.some(
                    (memberId) => memberId.toString() === user._id.toString()
                )

            if (!isAssigneeMember) {
                return res.status(400).json({
                    message: 'Assignee must belong to the project',
                })
            }

            ticket.assignee = user._id
        }

        await ticket.save()
        await ticket.populate('assignee', 'name email')

        res.status(200).json({
            message: 'Ticket assigned successfully',
            ticket,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to assign ticket',
            error: error.message,
        })
    }
}
