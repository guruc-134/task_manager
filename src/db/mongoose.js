const mongoose = require('mongoose');
// connecting to mongoose
const connectionString = process.env.MONGODB_URL
mongoose.connect(connectionString,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify:false  
})
// starting mongodb
// /Users/CHERRY/mongodb/bin/mongod.exe --dbpath=/Users/CHERRY/mongodb-data