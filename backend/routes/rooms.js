var express = require('express');
var router = express.Router();
let RoomModel = require('../module/Rooms');

// 获取所有房间数据
router.get('/', async function(req, res, next) {
  try {
    let list = await RoomModel.find();

    res.json({
      code: 200,
      msg: '查询成功',
      rooms: list
    });
  } catch (err) {
    res.status(500).json({ code: 500, error: err.message });
  }
});

// 根据 roomId 获取单个房间数据
router.get('/:id', async function(req, res, next) {
  try {
    console.log(req.params.id);
    const roomId = req.params.id;

    const room = await RoomModel.findOne({ roomId: roomId });

    if (!room) {
      return res.status(404).json({
        code: 404,
        msg: '未找到该房间',
        room: null
      });
    }

    res.json({
      code: 200,
      msg: '查询成功',
      room: room
    });

  } catch (err) {
    res.status(500).json({ code: 500, error: err.message });
  }
});

// 获取所有历史数据
router.get('/history', async function(req, res, next)
{
  try {
    let list = await RoomModel.find();
    res.json({
      code: 200,
      msg: '查询成功',
      history: list
    });
  }
  catch (err) {
    res.status(500).json({ code: 500, error: err.message });
  }
})


// 更新设备控制状态
router.post('/:id/device/control', async function(req, res, next) {
  try {
    const roomId = req.params.id;
    const { control } = req.body;

    // 验证控制值
    if (control !== '0' && control !== '1') {
      return res.status(400).json({
        code: 400,
        msg: '控制值必须为 0（关闭）或 1（开启）'
      });
    }

    // 查找并更新房间
    const room = await RoomModel.findOneAndUpdate(
      { roomId: roomId },
      { control: control },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        code: 404,
        msg: '未找到该房间'
      });
    }

    res.json({
      code: 200,
      msg: '设备控制状态更新成功',
      data: {
        roomId: room.roomId,
        control: room.control
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, error: err.message });
  }
});

// 获取设备控制状态
router.get('/:id/device/control', async function(req, res, next) {
  try {
    const roomId = req.params.id;

    const room = await RoomModel.findOne({ roomId: roomId });

    if (!room) {
      return res.status(404).json({
        code: 404,
        msg: '未找到该房间'
      });
    }

    res.json({
      code: 200,
      msg: '查询成功',
      data: {
        roomId: room.roomId,
        control: room.control || '0'
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, error: err.message });
  }
})

module.exports = router;
