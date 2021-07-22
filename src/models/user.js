const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require("./task")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        trim:true,
        minLength:7,
        required:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password cannot contain the word "password"')
            }
        }
    },
    email:
    {
        type:String,
        require:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(! validator.isEmail(value )){
                throw new Error('invalid email address')
            }
        }
    },
    age:{
        type:Number,
        default:0,  
        validate(value){
            if(value < 0){
                throw new Error("age must be >0")
            }
        }
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    avatar:{
        type:Buffer
    }
},
{
    timestamps:true
})
//  instead of storing the actual tasks into the user
//  basically we are establishing a relation between the user data and the task data
//  we are initially telling where to refer:
//  then we are saying which fields to compare
// i.e the _id from here has the value of user id and the owner from there also has the user id
// so when these two match then  we can say that this task was created by the user
userSchema.virtual('tasks',{
    ref:'Task',
    localField : '_id',
    foreignField : 'owner'
})

// toJSON is called everytime the function JSON.stringify() is called, express calls that function
// .everytime it sends data using res.send(), we have indirectly triggered this function to be called
// everytime
userSchema.methods.toJSON =  function()
{
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
} 
// methods => accessible by model instances
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token 
}
//  static methods => accessible by models
userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})
    if(!user) throw new Error('Unable to login')

    const isMatch = await bcrypt.compare(password,user.password) 
    if(!isMatch) throw new Error('Unable to login')

    return user
}
//  hashing the password before saving this runs before save() is called
userSchema.pre('save',async function(next){
    const user = this
    if( user.isModified('password')) 
    {
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

// delete user tasks when user is removed , this runs before remove is called()
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})
const User = mongoose.model('User',userSchema
)

module.exports = User