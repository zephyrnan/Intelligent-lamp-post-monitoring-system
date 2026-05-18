const mongoose = require('mongoose');
const Alarm = require('../module/Alarm');
const RoomListModel = require('../module/RoomsList');

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/roomMonitor')
  .then(() => console.log('✅ MongoDB连接成功'))
  .catch(err => {
    console.error('❌ MongoDB连接失败:', err);
    process.exit(1);
  });

async function checkData() {
  try {
    console.log('\n========================================');
    console.log('📊 检查数据库数据');
    console.log('========================================\n');

    // 检查报警数据
    console.log('【报警数据 (alarms)】');
    const alarmCount = await Alarm.countDocuments();
    console.log(`总数: ${alarmCount}`);

    if (alarmCount > 0) {
      const sampleAlarms = await Alarm.find().limit(3).sort({ timestamp: -1 });
      console.log('\n最近3条报警记录:');
      sampleAlarms.forEach((alarm, index) => {
        console.log(`\n${index + 1}. ${alarm.alarmId || alarm._id}`);
        console.log(`   房间: ${alarm.roomId || 'N/A'} - ${alarm.roomName || 'N/A'}`);
        console.log(`   类型: ${alarm.type || 'N/A'}`);
        console.log(`   级别: ${alarm.level || 'N/A'}`);
        console.log(`   状态: ${alarm.status || 'N/A'}`);
        console.log(`   时间: ${alarm.timestamp || 'N/A'}`);
        console.log(`   消息: ${alarm.message || 'N/A'}`);
      });

      // 统计
      const activeCount = await Alarm.countDocuments({ status: 'active' });
      const acknowledgedCount = await Alarm.countDocuments({ status: 'acknowledged' });
      const resolvedCount = await Alarm.countDocuments({ status: 'resolved' });
      console.log('\n报警统计:');
      console.log(`   活跃: ${activeCount}`);
      console.log(`   已确认: ${acknowledgedCount}`);
      console.log(`   已解决: ${resolvedCount}`);
    }

    console.log('\n----------------------------------------\n');

    // 检查历史数据
    console.log('【历史数据 (roomslist)】');
    const historyCount = await RoomListModel.countDocuments();
    console.log(`总数: ${historyCount}`);

    if (historyCount > 0) {
      const sampleHistory = await RoomListModel.find().limit(3).sort({ date: -1, time: -1 });
      console.log('\n最近3条历史记录:');
      sampleHistory.forEach((record, index) => {
        console.log(`\n${index + 1}. ${record._id}`);
        console.log(`   房间ID: ${record.roomId || 'N/A'}`);
        console.log(`   日期: ${record.date || 'N/A'}`);
        console.log(`   时间: ${record.time || 'N/A'}`);
        console.log(`   温度: ${record.temp || 'N/A'}°C`);
        console.log(`   湿度: ${record.hum || 'N/A'}%`);
        console.log(`   烟雾: ${record.smoke || 'N/A'}`);
        console.log(`   报警: ${record.warn || 'N/A'}`);
      });

      // 日期范围
      const oldest = await RoomListModel.findOne().sort({ date: 1, time: 1 });
      const newest = await RoomListModel.findOne().sort({ date: -1, time: -1 });
      console.log('\n数据时间范围:');
      console.log(`   最早: ${oldest.date} ${oldest.time}`);
      console.log(`   最新: ${newest.date} ${newest.time}`);
    }

    console.log('\n========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 检查数据失败:', error);
    process.exit(1);
  }
}

checkData();
