const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sensorDataSchema = new Schema({
    sensorId: {type: String, required: true},
    time: {type: Number},
    value: {type: Schema.Types.Decimal128},
  })

  var Sensor = mongoose.model('sensor24', sensorDataSchema)
  module.exports = Sensor;

  //This is my model