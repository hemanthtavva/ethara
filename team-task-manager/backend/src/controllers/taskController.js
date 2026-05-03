const prisma = require('../prisma/client');

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedToId, projectId } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
      if (!assignee) {
        return res.status(404).json({ success: false, message: 'Assigned user not found' });
      }
    }

    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status && validStatuses.includes(status) ? status : 'TODO',
        priority: priority && validPriorities.includes(priority) ? priority : 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
        projectId,
        createdById: req.user.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error creating task' });
  }
};

const getAllTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'ADMIN') {
      tasks = await prisma.task.findMany({
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          project: { members: { some: { userId: req.user.id } } },
          OR: [
            { assignedToId: req.user.id },
            { assignedToId: null },
          ],
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can see tasks assigned to them or unassigned tasks in their projects
    if (req.user.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
      });
      if (!isMember || (task.assignedToId !== null && task.assignedToId !== req.user.id)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error('Get task by id error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can update status of their own tasks or unassigned tasks in their projects
    if (req.user.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
      });
      if (!isMember || (task.assignedToId !== null && task.assignedToId !== req.user.id)) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only update your own tasks.' });
      }
      // Members can only change status
      const updateData = {};
      if (status) {
        const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        updateData.status = status;
      }

      const updated = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
      });

      return res.status(200).json({ success: true, data: updated });
    }

    // Admin can update everything
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status && validStatuses.includes(status)) updateData.status = status;
    if (priority && validPriorities.includes(priority)) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check membership for non-admin
    if (req.user.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: req.user.id } },
      });
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    let where = { projectId };
    if (req.user.role !== 'ADMIN') {
      where.OR = [
        { assignedToId: req.user.id },
        { assignedToId: null },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get tasks by project error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
};

const getOverdueTasks = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let where = {
      dueDate: { lt: now },
      status: { not: 'DONE' },
    };

    if (req.user.role !== 'ADMIN') {
      where.project = { members: { some: { userId: req.user.id } } };
      where.OR = [
        { assignedToId: req.user.id },
        { assignedToId: null },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching overdue tasks' });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProject,
  getOverdueTasks,
};
