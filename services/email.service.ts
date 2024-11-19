import sgMail from "@sendgrid/mail";
const host = process.env.HOST;
require('dotenv').config()
const sendingEmail = process.env.SENDING_EMAIL;

const homeURL = 'http://pivitle2.netlify.app';
const feedbackURL = 'mail@pivitle.com';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);


export const createResetPasswordEmail = (
  receiverEmail: string,
  resetTokenValue: string
): sgMail.MailDataRequired => {
  const email: sgMail.MailDataRequired = {
    to: receiverEmail,
    from: `${sendingEmail}`,
    subject: "Reset password link",
    text: "Some useless text",
    html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click on the following link, or paste this into your browser to complete the process:\n\n
  <a href="http://${host}/login/reset/${resetTokenValue}">http://${host}/login/reset/${resetTokenValue}</a> \n\n If you did not request this, please ignore this email and your password will remain unchanged.\n </p>`,
  };

  return email;
};



export const createResetConfirmationEmail = (receiverEmail: string): sgMail.MailDataRequired => {
  const email: sgMail.MailDataRequired = {
    to: receiverEmail,
    from: `${sendingEmail}`,
    subject: "Your password has been changed",
    text: "Some useless text",
    html: `<p>This is a confirmation that the password for your account ${receiverEmail} has just been changed. </p>`,
  };

  return email;
};

export const createVerificationEmail = (
  receiverEmail: string,
  OTP: string
): sgMail.MailDataRequired => {
  const email = {
    to: receiverEmail,
    from: `${sendingEmail}`,
    subject: "Email Verification",
    text: "This is a verification Email from Pivitle.",
    html: `<p>Your OTP for verification is ${OTP}. Valid for 10 minutes.</p>`,
  };

  return email;
};

export const paymentSuccessEmail = (
  receiverEmail: string,
): sgMail.MailDataRequired => {
  const email = {
    to: receiverEmail,
    from: `${sendingEmail}`,
    subject: "Paymnet Success",
    html: `<h4>Your payment is confirmed. Welcome to Pivitle.</h4>
           <p>To access your Pivitle 360 account, click on the button below.</p>
           <br />
           <a 
            style="color:white;
              background-color:rgba(97, 35, 255, 0.93);
              text-decoration: none;
              height: 60px;
              width: 160px;
              padding: 10px 15px;
              font-weight: 300;
              font-size: 15px;
              border-radius:5px;" 
            href=${[process.env.CLIENT_URL]}
           >Access Pivitle 360</a>`,
  };

  return email;
};


export const addUserEmail = (
  receiverEmail: string,
  url: string,
  name: string, 
): sgMail.MailDataRequired => {
  const email = {
    to: receiverEmail,
    from: `${sendingEmail}`,
    subject: `${name} invited you to Pivitle 360.`,
    html: addUserHTML(url, name)
  };

  return email;
};

export const requestAccess = (
  accessFor: string,
  receiverEmail: string,
  url: string,
  name: string, 
  entityName: string,
  requestMessage: string,
  ownerName?: string, 
): sgMail.MailDataRequired => {
  const email = {
    to: receiverEmail,
    from: `${sendingEmail}`,
    subject: `${name} requested access to your ${accessFor} ${entityName}.`,
    html: requestAccessHTML(url, name, entityName, requestMessage, accessFor, ownerName)
  };

  return email;
};

export const sendEntityInvite = (body: {
  receiverEmail: string,
  url: string,
  userName: string, 
  entity: string,
  entityType: string,
  ownerName: string,
  entityProject?: string,
  message: string
}): sgMail.MailDataRequired => {
  const email = {
    to: body.receiverEmail,
    from: `${sendingEmail}`,
    subject: `Invitation for ${body.entityType} ${body.entity}.`,
    html: sendEntityInviteHTML(body)
  };

  return email;
};

export const createContactUsEmail = (
  form: {
    discussAbout: string,
    companyEmail: string,
    firstName: string,
    lastName: string,
    companyName: string,
    jobTitle: string,
    service: string,
    people: number,
    question: string
  }
): sgMail.MailDataRequired => {
  
  const text = `${form.firstName} ${form.lastName} of company ${form.companyName} with job title ${form.jobTitle} has requeted info on topic ${form.discussAbout} & about service ${form.service}.`;
  const html = `<p>
    <b>${form.jobTitle} ${form.firstName} ${form.lastName}</b> of company <b>${form.companyName}</b> has requested information about topic <b>${form.discussAbout}</b> & about service <b>${form.service}</b>.<br><br>
    Company Name: <b>${form.companyName}</b><br>
    Company Email: <b>${form.companyEmail}</b><br>
    Number of People: <b>${form.people}</b><br>
    First Name: <b>${form.firstName}</b><br>
    Last Name: <b>${form.lastName}</b><br>
    Job Title: <b>${form.jobTitle}</b><br>
    Topic : <b>${form.discussAbout}</b><br>
    Service : <b>${form.service}</b><br>
    Question : <b>${form.question}</b>
  </p>`

  const email = {
    to: 'mail@pivitle.com',
    from: `${sendingEmail}`,
    subject: "Contact Us",
    text,
    html
  };

  return email;
};

export const sendEmail = async (email: sgMail.MailDataRequired) => sgMail.send(email);

export const sendMultiple = async (emails: sgMail.MailDataRequired) => sgMail.sendMultiple(emails);

export default {
  createResetPasswordEmail,
  createResetConfirmationEmail,
  createVerificationEmail,
  paymentSuccessEmail,
  createContactUsEmail,
  sendMultiple,
  sendEmail,
  addUserEmail,
  requestAccess,
  sendEntityInvite
};


const addUserHTML = (url: string, name: string) => `<p>
<b>${name}</b> invited you to Pivitle 360. 
<br><br>
Please click on the link below to set your password to access Pivitle 360.
<br>
<br> 

<a href=${url}><button ${VerifyButtonStyle('orange')}>Set Password</button></a> 

<br>
<br>
${emailSignature()}
<p>`

const requestAccessHTML = (url: string, name: string, entityName: string, requestMessage: string, accessFor: string, ownerName?: string, ) => `
${ownerName ? '<h4> Hi '+ownerName+'!</h4>' : ''}
<p><b>${name}</b> request access to your ${accessFor} <b>${entityName}</b>.</h3>
${requestMessage ? '<br><br><p>" '+requestMessage+' "</p><br>' : ''}
<h4>Click button below to grant access.</h4>

<a href=${url}><button ${VerifyButtonStyle('blue')}>Grant Access</button></a>

<br>
<br>
${emailSignature()}
<p>`

const sendEntityInviteHTML = (body: { url: string, ownerName: string, userName: string, entity: string, entityType: string, entityProject?: string, message: string }) => `
<h3>Hi ${body.userName}!<br></h3>
<p>${body.ownerName} has invited you to ${body.entityType} <b>${body.entity}</b>${body.entityProject ? ` for Project <b> ${body.entityProject}</b>` : ''}.</p>
${body.message ? '<br><br><p>" '+body.message+' "</p><br>' : ''}
<h3>Click button below to accept invitation.</h3><br>

<a href=${body.url}><button ${VerifyButtonStyle('blue')}>Accept Invite</button></a>

<br>
<br>
${emailSignature()}
<p>`


const VerifyButtonStyle = (color: string) => `
style="background-color: ${color};
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;"
onmouseover="this.style.backgroundColor='#219653';"
onmouseout="this.style.backgroundColor='#27ae60';";`;

const emailSignature = () => `
  <b>Thank you!</b>
  <br><b>Team - Pivitle</b>
  <br>Contact us: ${feedbackURL}
  <br>URL: <a href='${homeURL}'>Pivitle Home</a>
</body>`;