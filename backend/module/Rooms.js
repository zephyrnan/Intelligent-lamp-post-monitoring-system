let mongoose = require('mongoose');

let RoomSchema = new mongoose.Schema({
    roomId: String,
    temp: String,
    hum: String,
    lux: String,
    sc: String,
    sv: String,
    bv: String,
    smoke: String,
    warn: String,
    control: String,
    date: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    time: {
        type: String,
        default: () => new Date().toTimeString().split(' ')[0]
    }
}, {
    collection: 'rooms',  // 明确指定集合名称
    strict: false  // 允许schema之外的字段
});

// 创建索引以提高查询性能
RoomSchema.index({ roomId: 1 });
RoomSchema.index({ date: -1, time: -1 });
RoomSchema.index({ warn: 1 });

module.exports = mongoose.model('Room', RoomSchema);