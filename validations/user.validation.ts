import Joi from "joi";
import { UserDocument } from "../models/user.model";

export function validateUser(
  user: Pick<UserDocument, "username" | "email" | "password" | "isAdmin">
) {
  const schema = Joi.object({
    username: Joi.string().max(50).required(),
    email: Joi.string().max(255).required().email(),
    password: Joi.string().max(255).required(),
    isAdmin: Joi.boolean().required(),
  });

  return schema.validate(user);
}

export function validateLoginInput(input: Pick<UserDocument, "username" | "password">) {
  const schema = Joi.object({
    email: Joi.string().max(50).required(),
    password: Joi.string().max(255).required(),
  });

  return schema.validate(input);
}

export function validateRegisterInput(
  input: Pick<UserDocument, "username" | "email" | "password">
) {
  const schema = Joi.object({
    username: Joi.string().max(50),
    password: Joi.string().max(255).required(),
    lastName: Joi.string().max(255).required(),
    firstName: Joi.string().max(255).required(),
    email: Joi.string().max(255).required().email(),
    profilePhoto: Joi.string(),
    companyRole: Joi.string(),
    companySize: Joi.number()
  });

  return schema.validate(input);
}

export function validateChangePassword(
  input: Pick<UserDocument, "username" | "email" | "password">
) {
  const schema = Joi.object({
    password: Joi.string().max(255).required(),
    email: Joi.string().max(255).required().email(),
    OTP: Joi.string().min(4).max(4).required(),
  });

  return schema.validate(input);
}

export function validateEmail(input: Pick<UserDocument, "email">) {
  const schema = Joi.object({
    email: Joi.string().max(255).required().email(),
    OTP: Joi.string().min(4).max(4).required()
  });

  return schema.validate(input);
}

export function validatePassword(input: Pick<UserDocument, "password">) {
  const schema = Joi.object({
    password: Joi.string().max(255).required(),
  });
  return schema.validate(input);
}