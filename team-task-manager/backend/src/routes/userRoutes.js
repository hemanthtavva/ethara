const express = require('express');
const { getAllUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
