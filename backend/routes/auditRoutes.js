const express = require('express');
const router = express.Router();
const { getSystemErrorLogs, getAdminAuditLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/errors', getSystemErrorLogs);
router.get('/actions', getAdminAuditLogs);

module.exports = router;