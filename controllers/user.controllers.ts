import { Request, Response } from "express";
// import { subscriptions } from "../config";
import { Types } from "mongoose";
import sanitize from "mongo-sanitize";
import { validateEmail, validateRegisterInput, validateChangePassword } from "../validations/user.validation";
import UserService from "../services/user.service";
import LoggerService from "../services/logger.service";
import EmailService from "../services/email.service";
import { randomUUID } from "crypto";
import GroupsService from "../services/Groups.service";
const stripe = require('stripe')('sk_test_51MmgB1FV9jrTcTNndcjmfpSASC7UcGXKKkmCgL2Q0jUNwcZcn7gI2qcE7NClKWWsPsh82Uc7HiedYv2FADz3st8L00hQFVyc7N');


interface AuthenticatedUser {
  id: Types.ObjectId;
  email: string;
  subscriptions?: [];
  roles: [];
  admin: boolean;
  orgId: Types.ObjectId;
};

interface SubscriptionBody {
    title: string,
    price: number,
    teams: number,
    quantity: number,
    people: number,
    min: number,
    max: number,
    billingCycle: string
};

export const getUser = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;
  const data = await UserService.getUserData(user.id as Types.ObjectId);
  
  return res.status(200).send({ message: "Success", data });
};

export const updateUser = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;
  var body = req.body;
  
  delete body.personalAccess;
  
  const data = await UserService.updateUserData({ _id: user.id as Types.ObjectId, body });
  
  return res.status(200).send({ message: "Success", data });
};

export const postUser = async (req: Request, res: Response) => {
  // Validate Register input
  const { error } = validateRegisterInput(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  let sanitizedInput = sanitize<{ 
    firstName: string, 
    lastName: string, 
    username: string,
    password: string,
    email: string,
    active: boolean
    roles?: string[]
  }>(req.body);

  try {
    let user;
    user = await UserService.findUserBy("email", sanitizedInput.email.toLowerCase());

    if (user) {
      return res.status(400).send({ message: "Email already registered. Take an another email" });
    }

    sanitizedInput.active = true;
    sanitizedInput.roles = ['System Administrator'];
    const newUser = UserService.createUser(sanitizedInput);
    
    await UserService.setUserPassword(newUser, newUser.password);
    try {
      await UserService.saveUser(newUser);
      const OTP = await UserService.getOTP(sanitizedInput.email, 'register');

      if(!OTP) return res.status(400).send({ message: 'Error!' });
      
      const verificationEmail = EmailService.createVerificationEmail(
        newUser.email,
        OTP.OTP
      );      

      try {
        await EmailService.sendEmail(verificationEmail);

        return res.status(200).send({ message: "Success", email: newUser.email });
      } catch (error) {
        UserService.deleteUserById(newUser._id);

        return res.status(503).send({
          message: `Impossible to send an email to ${newUser.email}, try again. Our service may be down.`,
        });
      }
    } catch (error) {
      LoggerService.log.error(error);
      console.log(error);
      return res.status(500).send({ message: "Creation of user failed, try again." });
    }
  } catch (error) {
    LoggerService.log.error(error);
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send("An unexpected error occurred");
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  // Validate Register input
  const { error } = validateEmail(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  let sanitizedInput = sanitize<{ 
    email: string,
    OTP: string
  }>(req.body);

  try {

    const verified = await UserService.verifyEmail(sanitizedInput.email, sanitizedInput.OTP);
    if(!verified) return res.status(400).send({ message: 'Invalid code!' });
    
    return res.status(200).send({ message: 'Success', verified });
  } catch (error) {
    LoggerService.log.error(error);
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send("An unexpected error occurred");
  }
};

export const postUserCancel = (req: Request, res: Response) => {
  const { error } = validateEmail(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const sanitizedInputs = sanitize<{ email: string }>(req.body);

  try {
    UserService.deleteUnverifiedUserByEmail(sanitizedInputs.email);
    return res.status(200).send({ message: "User reset success" });
  } catch (error) {
    return res.status(500).send("An unexpected error occurred");
  }
};

export const resendCode = async (req: Request, res: Response) => {
  try {
    const reqQuery = req.query;
    if(!reqQuery.email || !reqQuery.for) return res.status(400).send({ message: `Please provide ${reqQuery.email ? 'for' : 'email'} in query!`});
    const OTP = await UserService.resendCode(`${reqQuery.email}`, `${reqQuery.for}`);
    if(!OTP) return res.status(400).send({ message: 'Error' });

    const verificationEmail = EmailService.createVerificationEmail(
      OTP.email,
      OTP.OTP
    );
    try {
      await EmailService.sendEmail(verificationEmail);
    } catch (error) {

      return res.status(503).send({
        message: `Unable to send an email to ${OTP.email}, try again. Our service may be down.`,
        error
      });
    }

    return res.status(200).send({ message: 'Success' });
  } catch (err) {
    
    return res.status(500).send("An unexpected error occurred");
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const reqQuery = req.query;
    if(!reqQuery.email) return res.status(400).send({ message: `Please provide 'email' in query!`});
    const OTP = await UserService.getOTP(`${reqQuery.email}`, 'forgotPassword');

    if(!OTP) return res.status(400).send({ message: 'Error'});

    const verificationEmail = EmailService.createVerificationEmail(
      OTP.email,
      OTP.OTP
    );
    try {
      await EmailService.sendEmail(verificationEmail);
    } catch (error) {

      return res.status(503).send({
        message: `Unable to send an email to ${OTP.email}, try again. Our service may be down.`,
        error
      });
    }
    
    return res.status(200).send({ message: 'Success', email: reqQuery.email });
  } catch (err) {
    console.log('====================================');
    console.log(err);
    console.log('====================================');
    
    return res.status(500).send("An unexpected error occurred");
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { error } = validateChangePassword(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const sanitizedInputs = sanitize<{ email: string, OTP: string, password: string }>(req.body);

    const data = await UserService.changePassword(sanitizedInputs.email, sanitizedInputs.OTP, sanitizedInputs.password);
    if(!data) return res.status(400).send({ message: "Error!" });

    return res.status(200).send({ message: "Success" });
  } catch (err) {
    console.log('====================================');
    console.log(err);
    console.log('====================================');

    return res.status(500).send("An unexpected error occurred");
  }
};

export const getSubscription = async (req: Request, res: Response) => {
  try {
    const subscriptionsBody = req.body as [SubscriptionBody];

    var stripeSubscriptionsList = [];
    var subscriptionsList = [];

    for(let j = 0; j<subscriptionsBody.length; j++) {
      const it = subscriptionsBody[j];
      
      const stripeProduct = await stripe.products.create({ name: it.title });
      const stripePrice = await stripe.prices.create({
        unit_amount: (it.price / it.quantity) * 100,
        currency: 'usd',
        product: stripeProduct.id,
      });

      stripeSubscriptionsList.push({ price: stripePrice.id, quantity: it.quantity });

      subscriptionsList.push({
        ...it,
        sid: randomUUID(),
        quantity: it.quantity
      });
    }
    if(!subscriptionsList.length) return res.status(400).send("subscription package not found!");

    const user = req.user as AuthenticatedUser;

    const session = await stripe.checkout.sessions.create({
      success_url: process.env.CLIENT_URL,
      line_items: stripeSubscriptionsList,
      mode: 'payment',
    });

    subscriptionsList = subscriptionsList.map(el => ({ ...el, csId: session.id }));

    await UserService.update({ email: user.email }, { $addToSet: { subscriptions: subscriptionsList }, csId: session.id });

    return res.status(200).send({ message: 'Success', data: session.url });
  } catch (err) {
    console.log('====================================');
    console.log(err);
    console.log('====================================');

    return res.status(500).send("An unexpected error occurred");
  }
};

export const paymentSuccess = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log(event.type);
    
    let user;

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        
        const csId = event.data.object.id;
        const paymentIntentId = event.data.object.payment_intent;

        user = await UserService.findOne({ csId });
        if (!user) {
          console.log('No User Found with checkoutSessionId:', csId);
          return res.status(404).send("User not found");
        }

        // Check for Payment Intent Status early to avoid delays in webhook firings
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if(paymentIntent.status == 'succeeded') {
          const subscriptionStatus = {
            paid: true,
            paymentDate: Date.now(),
          };
  
          // Send email on payment success
          if (user?.email) {
            await EmailService.sendEmail(EmailService.paymentSuccessEmail(user.email));
          }
          
          // Check for already Active Plan
          const activePlan = user.subscriptions.filter((el: any) => el.active);
          
          if (!activePlan.length) {
            subscriptionStatus['active'] = true;
            subscriptionStatus['activeFrom'] = Date.now();
          }
  
          // Update subscription based on payment success
          const subscriptions = user.subscriptions.map((el: any) => {
            // Check if paymentIntentId matches the filter
            if (el.csId == csId) {
              // Update subscription status only if there are no active plans
              if (!activePlan.length) {
                  const currentDate = new Date();
                  // Calculate the new end date based on the billing cycle
                  if (el.billingCycle === 'monthly') {
                      currentDate.setMonth(currentDate.getMonth() + 1);
                  } else if (el.billingCycle === 'yearly') {
                      currentDate.setFullYear(currentDate.getFullYear() + 1);
                  }
                  // Update subscription status with the new end date
                  subscriptionStatus['endDate'] = currentDate;
              }
          
              // Return the updated subscription object
  
              Object.keys(subscriptionStatus).forEach((k: String) => el[`${k}`] = subscriptionStatus[`${k}`]);
            }
            return el;
          });
  
          console.log({subscriptions});
  
          await UserService.update({ _id: user._id }, { subscribed: true, subscriptions });
        } else {

          interface Subscription {
            csId: string;
            paymentIntentId?: string; // Assuming paymentIntentId might not be there initially
          }
          
          const forSubscription = (user.subscriptions as Subscription[])?.filter((el: Subscription) => el.csId === csId) || [];
          
          if (forSubscription.length) {
            const updatedSubscriptions = (user.subscriptions as Subscription[]).filter((el: Subscription) => el.csId !== csId);
            var updatedSubscription = forSubscription[0];
            updatedSubscription.paymentIntentId = paymentIntentId;
          
            updatedSubscriptions.push(updatedSubscription);
          
            await UserService.update({ _id: user._id }, { paymentIntentId, subscriptions: updatedSubscriptions });
          }
        }

        return res.status(200).end();

      case 'checkout.session.async_payment_succeeded':
      case 'payment_intent.succeeded':
      case 'charge.succeeded':
        
        const paymentSuccess = event.data.object;
        const filter: any = {};

        if (event.type === 'charge.succeeded' || event.type === 'checkout.session.async_payment_succeeded') {
          filter['paymentIntentId'] = paymentSuccess.payment_intent;
        } else {
          filter['paymentIntentId'] = paymentSuccess.id;
        }

        user = await UserService.findOne(filter);
        if (!user) {
          console.log('No User Found with filter:', filter);
          return res.status(404).send("User not found");
        }

        const subscriptionStatus = {
          paid: true,
          paymentDate: Date.now(),
        };

        // Send email on payment success
        if (user?.email) {
          await EmailService.sendEmail(EmailService.paymentSuccessEmail(user.email));
        }
        
        // Check for already Active Plan
        const activePlan = user.subscriptions.filter((el: any) => el.active);
        
        if (!activePlan.length) {
          subscriptionStatus['active'] = true;
          subscriptionStatus['activeFrom'] = Date.now();
        }

        // Update subscription based on payment success
        const subscriptions = user.subscriptions.map((el: any) => {
          // Check if paymentIntentId matches the filter
          if (el.paymentIntentId == filter.paymentIntentId) {
            // Update subscription status only if there are no active plans
            if (!activePlan.length) {
                const currentDate = new Date();
                // Calculate the new end date based on the billing cycle
                if (el.billingCycle === 'monthly') {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                } else if (el.billingCycle === 'yearly') {
                    currentDate.setFullYear(currentDate.getFullYear() + 1);
                }
                // Update subscription status with the new end date
                subscriptionStatus['endDate'] = currentDate;
            }
        
            // Return the updated subscription object

            Object.keys(subscriptionStatus).forEach((k: String) => el[`${k}`] = subscriptionStatus[`${k}`]);
          }
          return el;
        });

        console.log({subscriptions});

        await UserService.update({ _id: user._id }, { subscribed: true, subscriptions });
        return res.status(200).end();

      default:
        console.log(`Unhandled event type ${event.type}`);
        return res.status(400).send(`Unhandled event type ${event.type}`);
        
    }
  } catch (err) {
    console.error('Error processing payment event:', err);
    return res.status(500).send("An unexpected error occurred");
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    let sanitizedInput = sanitize<{ 
      firstName: string, 
      lastName: string, 
      username: string,
      active: boolean,
      roles: [],
      password: string,
      email: string,
      orgId: Types.ObjectId
    }>(req.body);
    if(user.admin) {

      const exists = await UserService.findUserBy('email', sanitizedInput.email);
      if(exists) return res.status(400).send({ status: 'error', message: 'User already exists!' });

      sanitizedInput['orgId'] = user.orgId || user.id;
      const newUserBody = await UserService.createUser(sanitizedInput);

      const newUser = await UserService.saveUser(newUserBody);
      const personalAccess = await UserService.createPersonalAccess(newUser._id);
      await UserService.update({ _id: newUser._id }, { personalAccess: personalAccess._id });

      const URLBody = {
        id: newUser._id,
        email: newUser.email,
        subscriptions: [],
        roles: newUser.roles,
        orgId: user.id
      };

      const URL = await UserService.getRedirectURL(URLBody);
      
      // Getting Admin Name
      const admin = await UserService.findUserBy('_id', user.id);
      const name = admin ? `${admin?.firstName}  ${admin?.lastName}` : 'Admin';

      const verificationEmail = EmailService.addUserEmail(newUser.email, URL, name);

      await EmailService.sendEmail(verificationEmail);
      return res.status(200).send({ message: "Success", email: newUser.email });
    }
    return res.status(400).send({ message: "Error! Not admin." });
  } catch (err) {
    console.log('====================================');
    console.log(err);
    console.log('====================================');

    return res.status(500).send({ message: "An unexpected error occurred" });
  }
};

export const getAll = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;
  var page = 1;
  var limit = 10;
  const filter: any = { $or: [] };

  // Add the initial conditions
  filter.$or.push({ orgId: user.orgId || user.id });
  filter.$or.push({ _id: user.orgId || user.id });

  // Add search conditions if they exist
  if (req.query.search) {
    filter.$or.push(
      { email: { $regex: req.query.search, $options: "i" } }, 
      { firstName: { $regex: req.query.search, $options: "i" } }, 
      { lastName: { $regex: req.query.search, $options: "i" } }
    );
  }

  if(req.query.page) page = Number(req.query.page);
  if(req.query.limit) limit = Number(req.query.limit);
  if(req.query.roles) filter['roles'] = { $in: (req.query.roles as String).split(',') };
  if(req.query.id) filter['_id'] = { $in: (req.query.id as String).split(',') };

  const data = await UserService.getUsers(page, limit, filter);
  return res.status(200).send({ message: "Success", data });
};

export const combinedSearch = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;

  // Pagination
  var page = 1;
  var limit = 10;
  if(req.query.page) page = Number(req.query.page);
  if(req.query.limit) limit = Number(req.query.limit);

  // Filters
  const filter = {
    orgId: user?.id
  };
  const groupsFilter = {
    orgId: user.id
  };
  
  if(req.query.search) {
    filter['$or'] = [
      { email: { $regex: req.query.search, $options: "i" } }, 
      { firstName: { $regex: req.query.search, $options: "i" } }, 
      { lastName: { $regex: req.query.search, $options: "i" } } 
    ];
    groupsFilter['name'] = { $regex: req.query.search, $options: 'i' };
  }

  const users = await UserService.getUsers(page, limit, filter);

  const groups = await GroupsService.getGroups(page, limit, groupsFilter);
  const data = [ ...users, ...groups ];
  
  return res.status(200).send({ message: "Success", data });
};

export const feedback = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;

  const data = await UserService.createFeedback(user.id, req.body);;
  
  return res.status(200).send({ message: "Success", data });
};

export const cancelSubscription = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;
  const sid = req.params.sid;
  
  var data = await UserService.getUserData(user.id);
  if(!data) return res.status(404).send({ message: "Error" });

  var { subscriptions } : any  = data;

  const subscription = subscriptions.filter((el: any) => el.sid == sid)[0];
  if(!subscription) return res.status(400).send({ message: "No Subscription!" });

  subscriptions = subscriptions.filter((el: any) => el.sid != sid);

  subscription['cancelled'] = true;
  subscriptions.push(subscription);
  
  data = await UserService.update({ _id: user.id }, { subscriptions });
  
  return res.status(200).send({ message: "Success", data });
};

export const accessControl = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if(req.query.suspended) {
      const suspended = JSON.parse(req.query.suspended as string);
      await UserService.update({ _id: userId }, { suspended: suspended });
    }
    
    return res.status(200).send({ message: "Success" });
  } catch (error) {
    LoggerService.log.error(error);
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send("An unexpected error occurred");
  }
};


export default {
  getUser,
  updateUser,
  postUser,
  postUserCancel,
  verifyUser,
  resendCode,
  forgotPassword,
  changePassword,
  getSubscription,
  paymentSuccess,
  addUser,
  getAll,
  cancelSubscription,
  combinedSearch,
  feedback,
  accessControl
};