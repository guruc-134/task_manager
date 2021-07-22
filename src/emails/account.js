const sgMail = require('@sendgrid/mail')
const SendGridAPIkey = process.env.SENDGRID_API_KEY 

sgMail.setApiKey(SendGridAPIkey)

const sendWelcomeEmail = (email,name) =>{
    sgMail.send({
        to:email,
        from:'guruc134@gmail.com',
        subject: 'Thanks for joining in',
        text:`Hello, ${name}. Welcome to the Task Manager Application. Let me know how you get along with the app.`
    })
}
const sendExitMail = (email,name) =>{
    sgMail.send({
        to:email,
        from:'guruc134@gmail.com',
        subject: 'Sorry to see you go!',
        text:`Goodbye, ${name}. You have requested for account deletion, Is there anything we could have done better. Thank you for your time at Task Manager Application`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendExitMail
}