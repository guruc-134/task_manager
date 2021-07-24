const express = require('express')
const sharp = require('sharp')
const multer = require('multer')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middlewares/auth')
const {sendWelcomeEmail,sendExitMail} = require('../emails/account')
const upload = multer({
    limits:{
        fileSize:3000000
    },
    fileFilter(req,file,cb){
        if ( !file.originalname.match(/\.(jpg|jpeg|png|jfif)$/))
        return cb(new Error('please upload an image'))
        
        cb(undefined,true)
        
    }
})
// creating user
router.post('/users', async (req,res)=>{
    const user = new  User(req.body)
    try{
        await user.save()
    //  this is async but still we don't need to use await, as we need not wait till they get
    // their  mail in order to continue with the next steps
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }
    catch(e){
    res.status(400).send(e)
    }
})
// uploading/updating user avatar
router.post('/users/me/avatar',auth,  upload.single('avatar') , async (req,res)=>{
    const buffer =  await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send('uploaded')
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
}) 
// delete user avatar
router.delete('/users/me/avatar',auth , async (req,res)=>{
    req.user.avatar  = undefined
    await req.user.save()
    res.send('deleted')
}) 
// serving user avatar
router.get('/users/:id/avatar' , async (req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(! user || !user.avatar) throw new Error()
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch(e)
    {
        res.status(404).send()
    }
})
// user login
router.post('/users/login', async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }
    catch(e)
    {
        res.status(400).send()
    }
})
// user logout
router.post('/users/logout', auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    }
    catch(e)
    {
        res.status(500).send() 
    }
})
// user logout from all devices
router.post('/user/logoutAll', auth , async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch(e)
    {
        res.status(500).send()
    }
})
// fetching  user profile
router.get('/users/me', auth, async (req,res)=>{
    res.send(req.user)
})
// updating user details
router.patch('/users/me',  auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=>
        allowedUpdates.includes(update))
    if(! isValidOperation){
        return res.status(400).send({error:'Invalid updates!'})
    }
    try{
        const user = req.user
        updates.forEach(update=>user[update] = req.body[update])
        await user.save()
        // this replacement is done inorder to include the schema.pre to this call, findbyidandupdate bypasses mongoose and directly update
        // therefore we are using this approach
        // const user = await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
        res.send(user)
    }  
    catch(e)
    {
        res.status(400).send(e)
    }
})
// deleting a user 
router.delete('/users/me' ,  auth, async(req,res)=>{
    const _id = req.user._id
    const {name,email} = req.user
    try{
        await req.user.remove() // middleware is triggered
        sendExitMail(email,name)
        res.send(req.user)
    }
    catch(e){
        res.status(500).send()
    }
})
module.exports = router