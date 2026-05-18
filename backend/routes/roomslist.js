var express = require('express');
var router = express.Router();
let RoomListModel = require('../module/RoomsList');

// 获取历史数据，支持筛选和分页
router.get('/', async function(req, res, next) {
  try {
    const {
      roomId,           // 房间ID
      startDate,        // 开始日期 (YYYY-MM-DD)
      endDate,          // 结束日期 (YYYY-MM-DD)
      warnLevel,        // 报警等级 0-正常，1-警告，2-严重
      minTemp,          // 最低温度
      maxTemp,          // 最高温度
      minHum,           // 最低湿度
      maxHum,           // 最高湿度
      minSmoke,         // 最低烟雾浓度
      maxSmoke,         // 最高烟雾浓度
      page = 1,         // 页码，默认第1页
      pageSize = 20,    // 每页数量，默认20条
      sortBy = 'date',  // 排序字段，默认按日期
      sortOrder = 'desc' // 排序方向，desc 或 asc
    } = req.query;

    // 构建查询条件
    let query = {};

    // 房间ID筛选
    if (roomId) {
      query.roomId = roomId;
    }

    // 日期范围筛选
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    // 报警等级筛选
    if (warnLevel !== undefined && warnLevel !== '') {
      query.warn = warnLevel.toString();
    }

    // 温度范围筛选
    if (minTemp !== undefined || maxTemp !== undefined) {
      query.temp = {};
      if (minTemp !== undefined) {
        query.$expr = query.$expr || { $and: [] };
        if (!Array.isArray(query.$expr.$and)) {
          query.$expr.$and = [];
        }
        query.$expr.$and.push({ $gte: [{ $toDouble: '$temp' }, parseFloat(minTemp)] });
      }
      if (maxTemp !== undefined) {
        query.$expr = query.$expr || { $and: [] };
        if (!Array.isArray(query.$expr.$and)) {
          query.$expr.$and = [];
        }
        query.$expr.$and.push({ $lte: [{ $toDouble: '$temp' }, parseFloat(maxTemp)] });
      }
    }

    // 湿度范围筛选
    if (minHum !== undefined || maxHum !== undefined) {
      query.$expr = query.$expr || { $and: [] };
      if (!Array.isArray(query.$expr.$and)) {
        query.$expr.$and = [];
      }
      if (minHum !== undefined) {
        query.$expr.$and.push({ $gte: [{ $toDouble: '$hum' }, parseFloat(minHum)] });
      }
      if (maxHum !== undefined) {
        query.$expr.$and.push({ $lte: [{ $toDouble: '$hum' }, parseFloat(maxHum)] });
      }
    }

    // 烟雾浓度范围筛选
    if (minSmoke !== undefined || maxSmoke !== undefined) {
      query.$expr = query.$expr || { $and: [] };
      if (!Array.isArray(query.$expr.$and)) {
        query.$expr.$and = [];
      }
      if (minSmoke !== undefined) {
        query.$expr.$and.push({ $gte: [{ $toDouble: '$smoke' }, parseFloat(minSmoke)] });
      }
      if (maxSmoke !== undefined) {
        query.$expr.$and.push({ $lte: [{ $toDouble: '$smoke' }, parseFloat(maxSmoke)] });
      }
    }

    // 计算总数
    const total = await RoomListModel.countDocuments(query);

    // 计算分页（NaN 防护）
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSizeNum = Math.max(1, Math.min(100, parseInt(pageSize) || 20));
    const skip = (pageNum - 1) * pageSizeNum;

    // 排序字段白名单，防止 NoSQL 注入
    const ALLOWED_SORT_FIELDS = ['date', 'time', 'temp', 'hum', 'smoke', 'warn', 'roomId', 'lux', 'sc', 'sv', 'bv'];
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'date';
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

    // 构建排序
    let sort = {};
    if (safeSortBy === 'date') {
      sort.date = safeSortOrder;
      sort.time = safeSortOrder;
    } else {
      sort[safeSortBy] = safeSortOrder;
    }

    // 查询数据
    let list = await RoomListModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSizeNum);

    res.json({
      code: 200,
      msg: '查询成功',
      data: list,
      pagination: {
        total: total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum)
      }
    });
  } catch (err) {
    console.error('查询历史数据失败:', err);
    res.status(500).json({ code: 500, msg: '查询失败', error: err.message });
  }
});

module.exports = router;
