var mongoose = require('mongoose');

var Address = new mongoose.Schema({
    name: { type: String, default:'myStockAccount'},
    city: { type: String, default: 'Hyderabad' },
    state: { type: String, default: 'Telangana' },
    pincode: { type: String, default: '500085' },
    country: { type: String, default: 'INDIA' },
    contact_email: { type: String, default: 'bolledulas.pradeep@gmail.com' },
    contact_phone: { type: String, default: '**********' }    
});

module.exports = mongoose.model('Address', Address);