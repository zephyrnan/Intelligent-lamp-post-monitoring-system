let mongoose = require('mongoose');

let HistorySchema = new mongoose.Schema({
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
    collection: 'history',  // 明确指定集合名称
    strict: false  // 允许schema之外的字段
});

module.exports = mongoose.model('RoomHistory', HistorySchema);