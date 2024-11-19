import EmailService from "./email.service";
import { User, UserDocument } from "../models/user.model";
import HomeBlogBanner from '../assets/BlogBanner';
import { OTP } from "../models/OTP.model";
import { PersonalAccess } from "../models/PersonalAceess.model";
import { DOJO } from "../models/DOJO/DOJO.model";
import { Configurations } from "../models/Configurations.model";
import { Feedback } from "../models/Feedback.model";
import dayjs from "dayjs";
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { defaultPersonalAccess, defaultOrgAdminPersonalAccess, defaultFunctions } from '../constants/constants';
import { Functions } from "../models/Functions.model";
import TransformationRoadmapService from "./TransformationRoadmap.service";
import { Types } from "mongoose";

export const getUser = (user: UserDocument) => user.hidePassword();

export const getUserData = async (_id: Types.ObjectId) => {
  const data = await User.aggregate(getUserDataQuery({ _id }, { password: 0 }));
  return data[0];
};

export const createUser = ({
  username,
  email,
  password,
  firstName,
  lastName,
  active,
  orgId,
  profilePhoto,
  companySize,
  roles
}: {
  username: string;
  email: string;
  password: string;
  profilePhoto?: string;
  companySize?: number;
  firstName: string;
  lastName: string;
  roles?: string[],
  active: boolean,
  orgId?: Types.ObjectId
}) => new User({ username, email, password, firstName, profilePhoto, roles, companySize, lastName, active, orgId });

export const setResetPasswordToken = (
  user: UserDocument,
  resetTokenValue: string,
  expiryDate: Date
) => {
  user.passwordResetToken = resetTokenValue;
  user.passwordResetExpires = expiryDate;
};

export const find = async (filter: object) => await User.find(filter);

export const findOne = async (filter: object, projections?: string[]) => await User.findOne(filter, projections);

export const findUserBy = async (prop: string, value: any) => await User.findOne({ [prop]: value }).populate('personalAccess');

export const findUserById = async (id: Types.ObjectId, projections?: string[]) => await User.findById(id).populate('personalAccess').projection(projections || []);

export const saveUser = async (user: UserDocument) => await user.save();

export const updateUserData = async ({
  _id,
  body
}: {
  _id: Types.ObjectId;
  body: UserDocument;
}) => {

  if(body.password) {
    body.password = await bcryptjs.hash(body.password, 10);
    body.isVerified = true;
  }
  await User.findOneAndUpdate({ _id }, body);
  return await getUserData(_id);
};

export const setUserPassword = async (user: UserDocument, password: string) => {
  user.password = password;
  user.passwordResetToken = "";
  user.passwordResetExpires = dayjs().toDate();
  return await user.hashPassword();
};

export const setUserVerified = async (user: UserDocument) => {
  user.isVerified = true;
  user.expires = undefined;
};

export const deleteUserById = async (user: UserDocument) => await User.findByIdAndDelete(user._id);

export const deleteUnverifiedUserByEmail = async (email: string) => await User.findOneAndDelete({ email, isVerified: false });

export const getOTP = async (email: string, purpose: string, checkExistence= true) => {
  var user;
  if(checkExistence) {
    user = await User.findOne({ email });
    if(!user) return false;
  }

  const exists = await OTP.findOne({ email, for: purpose });

  if(exists) {
    // In case of OTP somehow exists in DB BUT email is being Freshly registered again then resend fresh OTP
    if(purpose == 'register') {
      return OTP.findOneAndUpdate({ email, for: purpose }, { OTP: getCode() }, { new: true });
    }
    return false;
  }

  return await OTP.create({ OTP: getCode(), email, for: purpose });
};

export const verifyEmail = async (email: string, code: string) => {
  const verified = await OTP.findOneAndDelete({ email, OTP: code, for: 'register' });
  console.log({verified});
  
  if(!verified) return false;
  var user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
  console.log({ user });
  
  if(!user) return;

  await DOJO.create({ orgId: user._id }); // DOJO Creation
  await Configurations.create({ orgId: user._id }); // Configurations Creation
  const personalAccess = await PersonalAccess.create({ userId: user._id, functions: defaultOrgAdminPersonalAccess }); // PersonalAccess Creation
  await Functions.create({ orgId: user._id, functions: defaultFunctions }) // Functions Creation
  await TransformationRoadmapService.create(getInitialHomeContent(user._id));
  user = await User.findOneAndUpdate({ _id: user._id }, { personalAccess }, { new: true });

  const data = {
    email: user?.email,
    id: user?._id,
    subscribed: user?.subscribed,
    subscriptions: user?.subscriptions,
    roles: user?.roles,
    orgId: user?.orgId
  };

  return {
    data: user,
    Authorization: await getToken(data)
  };
};

export const update = async (filter: object, body: object) => await User.findOneAndUpdate(filter, body, { new: true });

export const resendCode = async (email: string, purpose: string) => {
  const exists = await OTP.findOne({ email, for: purpose });
  if(!exists) return await getOTP(email, purpose);

  return await OTP.findOneAndUpdate({ email, for: purpose }, { OTP: getCode() }, { new: true });
};

export const changePassword = async (email: string, code: string, password: string) => {
  const exists = await OTP.findOneAndDelete({ email, OTP: code, for: 'forgotPassword' });
  if(!exists) return false;
  
  password = await bcryptjs.hash(password, 10);
  return await User.findOneAndUpdate({ email }, { password: password });
};

export const login = async (email: string, password: string) => {
  const data = await User.aggregate(getUserDataQuery({ email, active: true, suspended: false }));
  const user = data[0];
  if(!user) return false;

  const result = await bcryptjs.compare(password, user.password);
  if (!result) return false;

  await User.findOneAndUpdate({ email }, { lastLogin: new Date() });
  
  const body = {};
  if(user.isVerified) {
    const tokenData = {
      email: user.email,
      id: user._id,
      subscribed: user.subscribed,
      subscriptions: user.subscriptions,
      roles: user.roles,
      orgId: user.orgId
    };
    body['Authorization'] = await getToken(tokenData);
    delete user.password;
    body['data'] = user;
  } else {
    const OTP = await getOTP(user.email, 'register', false);
    if(OTP) {
      const verificationEmail = EmailService.createVerificationEmail(
        user.email,
        OTP.OTP
      );
      await EmailService.sendEmail(verificationEmail);
    }
    body['unverified'] = true;
  };

  console.log(body);
  
  return body;
};

export const getUsers = async (page: number, limit: number, filter: object) => await User.find(filter, { password: 0 }, { skip: limit*(page-1), limit }).populate('personalAccess');

export const handlePersonalAccess = async (filter: { userId: Types.ObjectId, orgId: Types.ObjectId }, body: object) => {
  const exists = await User.findOne({ _id: filter.userId, orgId: filter.orgId });
  if(!exists) return null;

  return await PersonalAccess.findOneAndUpdate({ userId: exists._id }, body, { $new: true });
};

export const createPersonalAccess = async (userId: Types.ObjectId) => await PersonalAccess.create({ userId, functions: defaultPersonalAccess });

export const createFeedback = async (userId: Types.ObjectId, body: object) => await Feedback.create({ userId, ...body });




let getToken = async (body: object) => await jwt.sign(body, process.env.JWT_SECRET || '', { expiresIn: process.env.JWT_EXPIRY });

let getCode = () => Math.floor(Math.random() * (9 * Math.pow(10, 4 - 1))) + Math.pow(10, 4 - 1);

let getRedirectURL = async (body: object) => {
  const token = await getToken(body);
  console.log({ token });
  return process.env.CLIENT_URL + '/#/pages/updatePassword' + '?token=' + token;
};

let getInitialHomeContent =(userId: Types.ObjectId) => ({
  content: {
    description: `<div class="se-component se-image-container __se__float-center"><figure><img src=${HomeBlogBanner} alt="" data-rotate="" data-proportion="true" data-align="center" data-size="," data-percentage="auto,auto" data-file-name="home_back.png" data-file-size="93578" data-origin="," style=""></figure></div><p><strong>Pivitle 360</strong> enables organizations and teams to visualize work by using enterprise Kanban boards and Lean metrics to</p><p>promote continuous flow of work and accelerate the speed of delivery. Teams can reduce bottlenecks and</p><p>dependencies, eliminate waste, improve their own team-defined processes, promote continuous improvement, and</p><p>scale delivery. Using the enterprise Kanban capabilities delivered by Pivitle 360, teams can deliver frequently toward</p><p>programs and value streams, and stay aligned to strategic objectives without sacrificing delivery speed or quality.</p>`
  },
  label: 'home',
  userId,
  orgId: userId,
  title: "Welcome to Pivitle 360",
  published: true,
  changes: false,
  internalEdit: false,
});

let getUserDataQuery = (filter: any = {}, projections = {}) => {
  if(filter._id) filter['_id'] = new Types.ObjectId(filter._id);

  var baseQuery: any[] = [{
    $match: filter,
  }, {
    $lookup: {
      from: 'personalaccesses',
      localField: '_id',
      foreignField: 'userId',
      as: 'personalAccess'
    },
  }, {
    $unwind: {
      path: '$personalAccess',
      preserveNullAndEmptyArrays: true
    },
  }, {
    $lookup: {
      from: 'users',
      localField: 'orgId',
      foreignField: '_id',
      pipeline: [{
        $project: {
          companyName: 1,
          profilePhoto: 1
        }
      }],
      as: 'org'
    },
  }, {
    $unwind: {
      path: '$org',
      preserveNullAndEmptyArrays: true
    }
  }];

  if(Object.keys(projections).length) baseQuery.push({
    $project: projections
  })

  return baseQuery;
};

export default {
  find,
  findOne,
  getUser,
  getUserData,
  updateUserData,
  getOTP,
  createUser,
  setResetPasswordToken,
  findUserBy,
  findUserById,
  saveUser,
  setUserPassword,
  setUserVerified,
  deleteUserById,
  deleteUnverifiedUserByEmail,
  verifyEmail,
  update,
  resendCode,
  changePassword,
  login,
  getRedirectURL,
  getUsers,
  handlePersonalAccess,
  createPersonalAccess,
  createFeedback
};
