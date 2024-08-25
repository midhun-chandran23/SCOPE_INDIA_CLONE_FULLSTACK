// models/country.js
const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
},
isoCode: {
    type: String,
    required: true,
    unique: true
}
});

const CountryModel = mongoose.model('Country', countrySchema);

module.exports = CountryModel;
