const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id : userOneId,
    name: 'Test user',
    email: 'test@jest.com',
    password: 'testing123',
    tokens:[
        {
            token:jwt.sign({_id:userOneId},process.env.JWT_SECRET)
        }
    ]
}
const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id : userTwoId,
    name: 'Test user2',
    email: 'test2@jest.com',
    password: 'testing!xyz',
    tokens:[
        {
            token:jwt.sign({_id:userTwoId},process.env.JWT_SECRET)
        }
    ]
}
const taskOne = {
    _id : new mongoose.Types.ObjectId(),
    description: ' test task by user one',
    completed:false,
    owner:userOneId
}
const taskTwo = {
    _id : new mongoose.Types.ObjectId(),
    description: ' test task true by user one',
    completed:true,
    owner:userOneId
}
const taskThree = {
    _id : new mongoose.Types.ObjectId(),
    description: ' test task by user two',
    completed:false,
    owner:userTwoId
}
const setUp = async () =>{
    await User.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await Task.deleteMany()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}
module.exports = {userOneId,userOne,userTwoId,userTwo,setUp,taskOne,taskTwo,taskThree}