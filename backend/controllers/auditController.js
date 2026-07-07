const ErrorLog = require('../models/ErrorLog');
const AdminLog = require('../models/AdminLog');

const getSystemErrorLogs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await ErrorLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ErrorLog.countDocuments();

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminAuditLogs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const actionFilter = req.query.action ? { action: req.query.action } : {};

    const logs = await AdminLog.find(actionFilter)
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminLog.countDocuments(actionFilter);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSystemErrorLogs, getAdminAuditLogs };