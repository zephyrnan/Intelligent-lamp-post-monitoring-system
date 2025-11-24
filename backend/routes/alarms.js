var express = require('express');
var router = express.Router();
const Alarm = require('../module/Alarm');

// 生成报警ID
function generateAlarmId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ALARM-${timestamp}-${random}`;
}

// 获取所有报警（支持筛选和分页）
router.get('/', async function(req, res, next) {
  try {
    const {
      roomId,
      type,
      level,
      status,
      startTime,
      endTime,
      page = 1,
      pageSize = 20
    } = req.query;

    // 构建查询条件
    let query = {};

    if (roomId) {
      query.roomId = roomId;
    }

    if (type) {
      query.type = type;
    }

    if (level) {
      query.level = level;
    }

    if (status) {
      query.status = status;
    }

    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) {
        query.timestamp.$gte = new Date(startTime);
      }
      if (endTime) {
        query.timestamp.$lte = new Date(endTime);
      }
    }

    // 分页查询
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const skip = (pageNum - 1) * pageSizeNum;

    // 查询总数
    const total = await Alarm.countDocuments(query);

    // 查询数据
    const alarms = await Alarm.find(query)
      .sort({ timestamp: -1 }) // 按时间倒序
      .skip(skip)
      .limit(pageSizeNum);

    res.json({
      code: 200,
      msg: '查询成功',
      data: alarms,
      pagination: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum)
      }
    });
  } catch (err) {
    console.error('获取报警列表失败:', err);
    res.status(500).json({
      code: 500,
      msg: '获取报警列表失败',
      error: err.message
    });
  }
});

// 创建报警
router.post('/', async function(req, res, next) {
  try {
    const { roomId, roomName, type, level, message } = req.body;

    if (!roomId || !type || !level || !message) {
      return res.status(400).json({
        code: 400,
        msg: '缺少必要字段'
      });
    }

    const alarm = new Alarm({
      alarmId: generateAlarmId(),
      roomId,
      roomName: roomName || roomId,
      type,
      level,
      message,
      status: 'active',
      acknowledged: false,
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0]
    });

    await alarm.save();

    res.json({
      code: 200,
      msg: '报警创建成功',
      data: alarm
    });
  } catch (err) {
    console.error('创建报警失败:', err);
    res.status(500).json({
      code: 500,
      msg: '创建报警失败',
      error: err.message
    });
  }
});

// 确认报警
router.put('/:alarmId/acknowledge', async function(req, res, next) {
  try {
    const { alarmId } = req.params;
    const { acknowledgedBy } = req.body;

    const alarm = await Alarm.findOne({ alarmId });

    if (!alarm) {
      return res.status(404).json({
        code: 404,
        msg: '未找到该报警'
      });
    }

    alarm.status = 'acknowledged';
    alarm.acknowledged = true;
    alarm.acknowledgedBy = acknowledgedBy || 'system';
    alarm.acknowledgedAt = new Date();

    await alarm.save();

    res.json({
      code: 200,
      msg: '报警已确认',
      data: alarm
    });
  } catch (err) {
    console.error('确认报警失败:', err);
    res.status(500).json({
      code: 500,
      msg: '确认报警失败',
      error: err.message
    });
  }
});

// 解决报警
router.put('/:alarmId/resolve', async function(req, res, next) {
  try {
    const { alarmId } = req.params;

    const alarm = await Alarm.findOne({ alarmId });

    if (!alarm) {
      return res.status(404).json({
        code: 404,
        msg: '未找到该报警'
      });
    }

    alarm.status = 'resolved';
    alarm.resolvedAt = new Date();

    await alarm.save();

    res.json({
      code: 200,
      msg: '报警已解决',
      data: alarm
    });
  } catch (err) {
    console.error('解决报警失败:', err);
    res.status(500).json({
      code: 500,
      msg: '解决报警失败',
      error: err.message
    });
  }
});

// 获取报警统计
router.get('/stats', async function(req, res, next) {
  try {
    const total = await Alarm.countDocuments();
    const active = await Alarm.countDocuments({ status: 'active' });
    const acknowledged = await Alarm.countDocuments({ status: 'acknowledged' });
    const resolved = await Alarm.countDocuments({ status: 'resolved' });

    const critical = await Alarm.countDocuments({ level: 'critical' });
    const high = await Alarm.countDocuments({ level: 'high' });
    const medium = await Alarm.countDocuments({ level: 'medium' });
    const low = await Alarm.countDocuments({ level: 'low' });

    res.json({
      code: 200,
      msg: '查询成功',
      data: {
        total,
        active,
        acknowledged,
        resolved,
        byLevel: {
          critical,
          high,
          medium,
          low
        }
      }
    });
  } catch (err) {
    console.error('获取报警统计失败:', err);
    res.status(500).json({
      code: 500,
      msg: '获取报警统计失败',
      error: err.message
    });
  }
});

// 删除报警
router.delete('/:alarmId', async function(req, res, next) {
  try {
    const { alarmId } = req.params;

    const result = await Alarm.deleteOne({ alarmId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        code: 404,
        msg: '未找到该报警'
      });
    }

    res.json({
      code: 200,
      msg: '删除成功'
    });
  } catch (err) {
    console.error('删除报警失败:', err);
    res.status(500).json({
      code: 500,
      msg: '删除报警失败',
      error: err.message
    });
  }
});

// 批量删除已解决的报警
router.delete('/batch/resolved', async function(req, res, next) {
  try {
    const result = await Alarm.deleteMany({ status: 'resolved' });

    res.json({
      code: 200,
      msg: `成功删除${result.deletedCount}条已解决的报警`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (err) {
    console.error('批量删除报警失败:', err);
    res.status(500).json({
      code: 500,
      msg: '批量删除报警失败',
      error: err.message
    });
  }
});

module.exports = router;
