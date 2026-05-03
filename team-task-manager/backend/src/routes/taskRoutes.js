const express = require('express');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProject,
  getOverdueTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// Must be before /:id to avoid conflicts
router.get('/overdue', getOverdueTasks);
router.get('/project/:projectId', getTasksByProject);

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);

// Admin only
router.post('/', adminOnly, createTask);
router.delete('/:id', adminOnly, deleteTask);

module.exports = router;
