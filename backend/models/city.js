const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
},
state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true
}
});

const CityModel = mongoose.model('City', citySchema);

module.exports = CityModel;