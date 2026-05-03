const prisma = require('../prisma/client');

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        createdById: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Server error creating project' });
  }
};

const getAllProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
          _count: { select: { tasks: true, members: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: { some: { userId: req.user.id } },
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
          _count: { select: { tasks: true, members: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching projects' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Members can only access projects they belong to
    if (req.user.role !== 'ADMIN') {
      const isMember = project.members.some((m) => m.userId === req.user.id);
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this project.' });
      }
      // Filter tasks: show assigned to this member OR unassigned
      project.tasks = project.tasks.filter((t) => t.assignedToId === req.user.id || t.assignedToId === null);
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Get project by id error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching project' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: name || project.name,
        description: description !== undefined ? description : project.description,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Server error updating project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await prisma.project.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting project' });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });

    if (existingMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
        role: role || 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: 'Server error adding member' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Member not found in this project' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: id, userId } },
    });

    res.status(200).json({ success: true, message: 'Member removed from project' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: 'Server error removing member' });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
