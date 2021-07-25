const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOneId,userOne,userTwoId,userTwo,setUp,taskOne,taskTwo,taskThree} = require('./fixtures/db')

beforeEach(setUp)
test("Should create task for user", async () =>{
    const resp = await request(app)
    .post('/tasks')
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        description:'this is a test'
    })
    .expect(201)
    //  checking if the task was added to db correctly
    const task = await Task.findById(resp.body._id)
    expect(task).not.toBe(null)
    //  checking if the owner of the task is set correctly
    expect(task.owner).toEqual(userOneId)
})
test("Should not create tasks with invalid fields", async () =>{
    const resp = await request(app)
    .post('/tasks')
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        title:'invalid field'
    })
    .expect(400)
    //  checking if the task was added to db
    const task = await Task.findById(resp.body._id)
    expect(task).toBe(null)
})
test("Should get tasks", async () =>{
    const resp = await request(app)
    .get('/tasks')
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    expect(resp.body.length).toBe(2)
})
test("Should not delete unauthorized user tasks", async () =>{
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .send()
    .expect(401)
    //  checking if task one is actually not deleted
    const task = await  Task.findById(taskOne._id)
    expect(task).not.toBe(null)
})
test("Should delete user tasks", async () =>{
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    //  checking if task one is actually not deleted
    const task = await  Task.findById(taskOne._id)
    expect(task).toBe(null)
})
test("Should not delete other user tasks", async () =>{
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization",`Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
    //  checking if task one is actually not deleted
    const task = await  Task.findById(taskOne._id)
    expect(task).not.toBe(null)
})