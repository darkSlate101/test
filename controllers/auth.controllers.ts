import { Request, Response, NextFunction } from "express";
import sanitize from "mongo-sanitize";
import { validateEmail, validateLoginInput } from "../validations/user.validation";
import { Types } from "mongoose";

import dayjs from "dayjs";
import UserService from "../services/user.service";
import TokenService from "../services/token.service";
import LoggerService from "../services/logger.service";
import EmailService from "../services/email.service";
import { checkForAndRoles } from "helpers";


interface AuthenticatedUser {
  id: Types.ObjectId;
  email: string;
  subscriptions?: [];
  roles: [];
  admin: boolean;
  orgId: Types.ObjectId;
};


export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = validateLoginInput(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });
  
    let sanitizedInput = sanitize<{ email: string; password: string }>(req.body);

    const data = await UserService.login(sanitizedInput.email, sanitizedInput.password);
    
    if(!data) return res.status(401).send({ message: 'Unauthorized' });
    return res.status(200).send({ message: 'Success', data });
  } catch (error) {
    LoggerService.log.error(error);
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    return res.status(500).send({ message: "An unexpected error occurred" });
  }
};

export const postLoginForgot = async (req: Request, res: Response) => {
  const { error } = validateEmail(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const sanitizedInput = sanitize<{ email: string }>(req.body);

  try {
    const user = await UserService.findUserBy("email", sanitizedInput.email);
    if (!user) return res.status(404).send({ message: "No user found with this email address." });

    const resetToken = TokenService.createToken();
    const tokenExpiryDate = dayjs().add(12, "hours").toDate();

    TokenService.setUserId(resetToken, user.id);
    UserService.setResetPasswordToken(user, resetToken.token, tokenExpiryDate);

    await UserService.saveUser(user);
    await TokenService.saveToken(resetToken);

    try {
      const email = EmailService.createResetPasswordEmail(user.email, resetToken.token);
      await EmailService.sendEmail(email);

      return res
        .status(200)
        .send({ message: `A reset passowrd email has been sent to ${user.email}` });
    } catch (error) {
      LoggerService.log.error(error);

      return res.status(503).send({
        message: `Impossible to send an email to ${user.email}, try again. Our service may be down.`,
      });
    }
  } catch (error) {
    LoggerService.log.error(error);

    return res.status(500).send({ message: "An unexpected error occurred" });
  }
};

export const postLogout = (req: Request, res: Response) => {
  req.session.destroy((err: Error) => {
    if (err) {
      res.status(500).send({ message: "Logout failed", err });
    }
    req.sessionID = "";
    // req.logout();
    res.status(200).send({ message: "Logout success" });
  });
};

export const postVerify = async (req: Request, res: Response) => {
  const { error } = validateEmail(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const sanitizedInput = sanitize<{ email: string }>(req.body);

  try {
    const user = await UserService.findUserBy("email", sanitizedInput.email);
    if (!user) {
      return res.status(404).send({ message: "No user found with this email address." });
    }
    if (user.isVerified) {
      return res.status(400).send({
        message: "This account has already been verified. Please log in.",
      });
    }

    const verificationToken = TokenService.createToken();
    TokenService.setUserId(verificationToken, user.id);

    await TokenService.saveToken(verificationToken);
    try {
      const email = EmailService.createVerificationEmail(user.email, verificationToken.token);
      await EmailService.sendEmail(email);

      return res.status(200).send({ message: `A verification email has been sent.` });
    } catch (error) {
      LoggerService.log.error(error);

      return res.status(503).send({
        message: `Impossible to send an email to ${user.email}, try again. Our service may be down.`,
      });
    }
  } catch (error) {
    LoggerService.log.error(error);

    return res.status(500).send("An unexpected error occurred");
  }
};

export const handlePersonalAccess = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as AuthenticatedUser;
  
  try {
    checkForAndRoles(req.body);
    
    const filter = {
      orgId: user.orgId || user.id,
      userId: new Types.ObjectId(req.params.userId)
    };
    
    const data = await UserService.handlePersonalAccess(filter, req.body);
    return res.status(200).send({ message: 'Success', data });
  } catch (error) {
    LoggerService.log.error(error);
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    return res.status(500).send({ message: "An unexpected error occurred" });
  }
};


export default {
  postLogin,
  postLogout,
  postVerify,
  postLoginForgot,
  handlePersonalAccess
};
