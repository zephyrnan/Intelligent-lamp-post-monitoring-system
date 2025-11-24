var express = require('express');
var router = express.Router();
const PersonDetection = require('../module/PersonDetection');

// 生成检测ID
function generateDetectionId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `DET-${timestamp}-${random}`;
}

// 创建人员检测记录
router.post('/person', async function(req, res, next) {
  try {
    const { roomId, originalImage, detectedImage, personCount, detections } = req.body;

    if (!roomId) {
      return res.status(400).json({
        code: 400,
        msg: '房间ID不能为空'
      });
    }

    // 创建检测记录
    const detection = new PersonDetection({
      detectionId: generateDetectionId(),
      roomId,
      personCount: personCount || 0,
      originalImage: originalImage || '',
      detectedImage: detectedImage || '',
      detections: detections || [],
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0]
    });

    await detection.save();

    res.json({
      code: 200,
      msg: '人员检测记录创建成功',
      data: detection
    });
  } catch (err) {
    console.error('创建人员检测记录失败:', err);
    res.status(500).json({
      code: 500,
      msg: '创建人员检测记录失败',
      error: err.message
    });
  }
});

// 获取所有检测记录（支持分页和筛选）
router.get('/', async function(req, res, next) {
  try {
    const {
      roomId,
      detectionId,
      startTime,
      endTime,
      page = 1,
      pageSize = 24
    } = req.query;

    // 构建查询条件
    let query = {};

    if (roomId) {
      query.roomId = roomId;
    }

    if (detectionId) {
      query.detectionId = new RegExp(detectionId, 'i'); // 支持模糊搜索
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
    const total = await PersonDetection.countDocuments(query);

    // 查询数据
    const detections = await PersonDetection.find(query)
      .sort({ timestamp: -1 }) // 按时间倒序
      .skip(skip)
      .limit(pageSizeNum);

    res.json({
      code: 200,
      msg: '查询成功',
      data: detections,
      pagination: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum)
      }
    });
  } catch (err) {
    console.error('获取检测记录失败:', err);
    res.status(500).json({
      code: 500,
      msg: '获取检测记录失败',
      error: err.message
    });
  }
});

// 根据检测ID获取单个检测记录
router.get('/:detectionId', async function(req, res, next) {
  try {
    const { detectionId } = req.params;

    const detection = await PersonDetection.findOne({ detectionId });

    if (!detection) {
      return res.status(404).json({
        code: 404,
        msg: '未找到该检测记录'
      });
    }

    res.json({
      code: 200,
      msg: '查询成功',
      data: detection
    });
  } catch (err) {
    console.error('获取检测记录失败:', err);
    res.status(500).json({
      code: 500,
      msg: '获取检测记录失败',
      error: err.message
    });
  }
});

// 删除检测记录
router.delete('/:detectionId', async function(req, res, next) {
  try {
    const { detectionId } = req.params;

    const result = await PersonDetection.deleteOne({ detectionId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        code: 404,
        msg: '未找到该检测记录'
      });
    }

    res.json({
      code: 200,
      msg: '删除成功'
    });
  } catch (err) {
    console.error('删除检测记录失败:', err);
    res.status(500).json({
      code: 500,
      msg: '删除检测记录失败',
      error: err.message
    });
  }
});

// 根据房间ID执行人员检测（模拟）
router.post('/detect/:roomId', async function(req, res, next) {
  try {
    const { roomId } = req.params;

    // TODO: 这里应该调用实际的视频流截图和AI检测服务
    // 目前先返回模拟数据

    // 模拟检测结果
    const personCount = Math.floor(Math.random() * 5); // 随机0-4人
    const detections = [];

    for (let i = 0; i < personCount; i++) {
      detections.push({
        class: 0, // 0 表示人员
        confidence: 0.8 + Math.random() * 0.2, // 0.8-1.0的置信度
        label: 'person',
        bbox: {
          x: Math.random() * 100,
          y: Math.random() * 100,
          width: 50 + Math.random() * 50,
          height: 100 + Math.random() * 50
        }
      });
    }

    // 创建检测记录
    const detection = new PersonDetection({
      detectionId: generateDetectionId(),
      roomId,
      personCount,
      originalImage: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`, // 1x1 透明图片
      detectedImage: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
      detections,
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0]
    });

    await detection.save();

    res.json({
      code: 200,
      msg: '人员检测完成',
      data: {
        detectionId: detection.detectionId,
        roomId: detection.roomId,
        personCount: detection.personCount,
        detections: detection.detections,
        timestamp: detection.timestamp
      }
    });
  } catch (err) {
    console.error('人员检测失败:', err);
    res.status(500).json({
      code: 500,
      msg: '人员检测失败',
      error: err.message
    });
  }
});

module.exports = router;
