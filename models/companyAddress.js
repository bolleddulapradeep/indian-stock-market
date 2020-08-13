var mongoose = require('mongoose');

var Address = new mongoose.Schema({
    name: { type: String, default:'myStockAccount'},
    city: { type: String, default: 'Hyderabad' },
    state: { type: String, default: 'Telangana' },
    pincode: { type: String, default: '500085' },
    country: { type: String, default: 'INDIA' },
    contact_email: { type: String, default: 'bolledulas.pradeep@gmail.com' },
    contact_phone: { type: String, default: '**********' },
    stockDetails: {
        stockName: { type: String, required: [true, 'Stock Name is required'] },
        numberOfShares :{type:Number, required:[true,'Shares are Requires']},
        buy: { type: Number, default: 200 },
        sel: { type: Number, default: 250 },
        buyedAt: { type: Date, default: new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }), },
        soldAT: { type: Date, default: new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }), }
    }
});

module.exports = mongoose.model('Address', Address);