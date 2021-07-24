const app = require('./app')

const port = process.env.PORT

app.listen(port,()=>{
    console.log('serve is listening on port',port)
})
