const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/roleController');
const { checkPermission, checkRoleLevel, loadPermissions } = require('../middleware/checkPermission');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// Apply rate limiter
router.use(apiLimiter);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all roles with permissions
 */
router.get('/', 
  loadPermissions,
  RoleController.getAllRoles
);

/**
 * @swagger
 * /api/roles/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         description: Filter by resource
 *     responses:
 *       200:
 *         description: List of all permissions
 */
router.get('/permissions',
  loadPermissions,
  RoleController.getAllPermissions
);

/**
 * @swagger
 * /api/roles/{roleId}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role details with permissions
 */
router.get('/:roleId',
  loadPermissions,
  RoleController.getRoleById
);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - displayName
 *               - description
 *               - level
 *             properties:
 *               name:
 *                 type: string
 *               displayName:
 *                 type: string
 *               description:
 *                 type: string
 *               level:
 *                 type: number
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.post('/',
  checkPermission('role:manage'),
  RoleController.createRole
);

/**
 * @swagger
 * /api/roles/{roleId}:
 *   put:
 *     summary: Update role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.put('/:roleId',
  checkPermission('role:manage'),
  RoleController.updateRole
);

/**
 * @swagger
 * /api/roles/{roleId}:
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 */
router.delete('/:roleId',
  checkPermission('role:manage'),
  RoleController.deleteRole
);

/**
 * @swagger
 * /api/roles/assign:
 *   post:
 *     summary: Assign role to user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role assigned successfully
 */
router.post('/assign',
  loadPermissions,
  checkPermission('user:manage'),
  RoleController.assignRole
);

/**
 * @swagger
 * /api/roles/{roleId}/users:
 *   get:
 *     summary: Get users with specific role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         default: 20
 *     responses:
 *       200:
 *         description: List of users with the role
 */
router.get('/:roleId/users',
  loadPermissions,
  RoleController.getUsersByRole
);

/**
 * @swagger
 * /api/roles/seed:
 *   post:
 *     summary: Seed default roles and permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Defaults seeded successfully
 */
router.post('/seed',
  checkRoleLevel(100), // Only admins
  RoleController.seedDefaults
);

module.exports = router;
