const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    (this.user = user),
      (this.url = url),
      (this.to = user.email),
      (this.from = `Mo Elshemy<${process.env.EMAIL_FROM}>`);
    this.firstName = this.user.name.split(' ')[0];
  }
  // trnasporter method
  newTransport() {
    // sendGrid for production
    if (process.env.NODE_ENV === 'production') {
      //sendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    //mailTrap for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send method
  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      subject,
      url: this.url,
    });
    const mailOptions = {
      html,
      to: this.to,
      from: this.from,
      subject,
      text: convert(html),
    };
    await this.newTransport().sendMail(mailOptions);
  }

  //send welcome method
  async sendWelcom() {
    await this.send('welcome', 'welcome to our family');
  }

  //send passwordReset
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password Reset Token (valid until 10 min)',
    );
  }

  async sendConfirmEmail() {
    await this.send('confirmEmail', 'confirm your email address');
  }
};

//send Confirm email

// const sendEmail = async (options) => {
//   // 1) create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   // 2) Define the email option
//   const mailOptions = {
//     from: `moElshemy <elshemy.io>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html
//   };
//   // 3) send the email
//   await transporter.sendMail(mailOptions);
// };
// module.exports = sendEmail;
