import express from 'express'

import {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
    addTeamMember,
    removeTeamMember,
} from '../controllers/projectController.js'

import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Create Project
router.post('/', authMiddleware, createProject)

// Get All Projects
router.get('/', authMiddleware, getProjects)

// Update Project
router.put('/:id', authMiddleware, updateProject)

// Delete Project
router.delete('/:id', authMiddleware, deleteProject)

// Add Team Member
router.post('/:id/members', authMiddleware, addTeamMember)

// Remove Team Member
router.delete('/:id/members', authMiddleware, removeTeamMember)

export default router
