const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middlewares/auth')
//  creating a task
router.post('/tasks', auth, async (req,res)=>{ 
    const task = new Task({...req.body,owner:req.user._id})
    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})
//  fetching all the tasks
//   completed={value}, limit={value}, skip ={value} , sortBy = createdAt:inc or createdAt:dsc
router.get('/tasks',auth , async (req,res)=>{
    const match = {}
    const sort = {}
    if (req.query.completed) match.completed = req.query.completed === 'true'

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 :1
    }
    try{
        // alternative
        // const tasks = await Task.find({owner:req.user._id})
        await req.user.populate(
            {
                path:'tasks',
                match,
                options:{
                    limit:parseInt(req.query.limit),
                    skip:parseInt(req.query.skip),
                    sort
                }
            }
        ).execPopulate()
        res.send(req.user.tasks )
        res.send(tasks)
    }
    catch(err){
        res.status(500).send()
    }
})
// fetching a task
router.get('/tasks/:id',auth ,async (req,res)=>{
    const _id  = req.params.id
    try{
        // the fetched task shall be the one with the required id and also created by the same user
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)

    }
    catch(err){
        res.status(500).send()
    }
})
// updating a task
router.patch('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed','description']
    const isValidOperation = updates.every(update=>allowedUpdates.includes(update))
    if(! isValidOperation) return res.status(400).send({error:'invalid operation'})
    try{
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task)
        return res.status(404).send()

        updates.forEach(update=>task[update]= req.body[update])
        await task.save()
        // const task = await Task.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true} )

        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})
// deleting a task
router.delete('/tasks/:id',auth, async (req,res)=>{ 
    const _id = req.params.id
    try{
        const task = await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task) return res.status(404).send()
        res.send(task)
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})

module.exports = router