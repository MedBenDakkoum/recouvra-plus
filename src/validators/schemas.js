const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("agent", "manager", "admin").default("agent"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const clientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  company: Joi.string().optional(),
});

const invoiceSchema = Joi.object({
  invoiceNumber: Joi.string().required(),
  client: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default("TND"),
  issueDate: Joi.date().optional(),
  dueDate: Joi.date().required(),
  status: Joi.string().valid("pending", "overdue", "partial", "paid").default("pending"),
  description: Joi.string().optional(),
});

const paymentSchema = Joi.object({
  invoice: Joi.string().required(),
  amount: Joi.number().positive().required(),
  paymentDate: Joi.date().optional(),
  paymentMethod: Joi.string().valid("virement", "cheque", "especes", "carte").required(),
});

const actionSchema = Joi.object({
  client: Joi.string().required(),
  invoice: Joi.string().optional(),
  type: Joi.string().valid("appel", "email", "courrier", "visite").required(),
  date: Joi.date().optional(),
  result: Joi.string().optional(),
  comment: Joi.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  clientSchema,
  invoiceSchema,
  paymentSchema,
  actionSchema,
};