const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rstephen2000@gmail.com',
        subject: 'Thanks for joining in',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rstephen2000@gmail.com',
        subject: 'Sad to see you going',
        text: `Goodbye ${name}. Is there anything we could have done to kept you on board`
    })
}

module.exports = { sendWelcomeEmail, sendGoodbyeEmail }