const express = require('express');
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Admin only
router.post('/', adminOnly, createProject);
router.put('/:id', adminOnly, updateProject);
router.delete('/:id', adminOnly, deleteProject);
router.post('/:id/members', adminOnly, addMember);
router.delete('/:id/members/:userId', adminOnly, removeMember);

module.exports = router;
