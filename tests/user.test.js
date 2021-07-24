const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

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
// before each is a jest lifecycle method which will be
// running before every test(), here it performs the operation
// of clearing the user database
beforeEach(async ()=>{
    await User.deleteMany()
    await new User(userOne).save()
})
// tests
test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
            name : 'Guru Charan',
            email: 'guru@example123.com',
            password: '12341234'
        }).expect(201)
    //  asserting that the user is stored in the database
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    //  assertion about the response
    expect(response.body).toMatchObject(
        {
            user:
            {
                name : 'Guru Charan',
                email: 'guru@example123.com',
            },
            token:user.tokens[0].token
        }
    )
    // assertion about password hashing
    expect(user.password).not.toBe('12341234')
})
test('Should login existing user', async ()=>{``
    const resp = await request(app).post('/users/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)
    // checking if correct token is sent
    const user = await User.findById(userOneId)
    expect(resp.body.token).toBe(user.tokens[1].token)
})
test('Should  not login nonexisting user', async ()=>{
    await request(app).post('/users/login').send({
        email:userOne.email+'not',
        password:userOne.password
    }).expect(400)
})
test('Should get profile for user', async () =>{
    await request(app)
    .get('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})
test("Should not get profile for un authenticated user", async ()=>{
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})
test("Should delete account for user", async () =>{
    await request(app)
    .delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBe(null)
})
test("Should not delete account for unauthorized user", async () =>{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})