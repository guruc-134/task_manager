const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
// const bcrypt = require('bcryptjs')
const {userOneId,userOne,setUp} = require('./fixtures/db')
// before each is a jest lifecycle method which will be
// running before every test(), here it performs the operation
// of clearing the user database
beforeEach(setUp)
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
test('Should upload avatar', async ()=>{
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('avatar','tests/fixtures/lion.jpg')
    .expect(200)
    const user = await User.findById(userOneId)
    //  checking is the image is uploaded by 
    // verifying the type of the user.avatar in Db is equal to Buffer
    // expect.any(), checks if the expected value's type is any of the following mentioned 
    //  in the params
    expect(user.avatar).toEqual(expect.any(Buffer))
})
test("Should update valid user fields", async ()=>
{
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name:'new test user',
        email:'jest@test.com',
        password:"testing456"
    })
    .expect(200)

    var {name,email} = await User.findById(userOneId)
    expect({name,email}).toEqual(
        {
            name:'new test user',
            email:'jest@test.com'
        }
    )
})
test("Should not update invalid user fields", async ()=>
{
    // unauthorized user
    await request(app)
    .patch('/users/me')
    .send({
        name:'new test user',
        email:'jest@test.com',
        password:'testing456'
    })
    .expect(401)

    //  invalid fields
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        place:'vizag'
    })
    .expect(400)

    //  invalid  values
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        email:'1234'
    })
    .expect(400)
})
