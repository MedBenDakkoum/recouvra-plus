const Joi = require('joi');

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

// Payload for updating a client (all fields optional but must send at least one)
const clientUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string(),
  company: Joi.string(),
}).min(1);

const invoiceSchema = Joi.object({
  invoiceNumber: Joi.string().required(),
  client: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('TND'),
  issueDate: Joi.date().optional(),
  dueDate: Joi.date().required(),
  status: Joi.string().valid('pending', 'overdue', 'partial', 'paid').default('pending'),
  description: Joi.string().optional(),
});

// Payload for updating an invoice (partial updates allowed)
const invoiceUpdateSchema = Joi.object({
  invoiceNumber: Joi.string(),
  client: Joi.string(),
  amount: Joi.number().positive(),
  currency: Joi.string(),
  issueDate: Joi.date(),
  dueDate: Joi.date(),
  status: Joi.string().valid('pending', 'overdue', 'partial', 'paid'),
  description: Joi.string(),
}).min(1);

const paymentSchema = Joi.object({
  invoice: Joi.string().required(),
  amount: Joi.number().positive().required(),
  paymentDate: Joi.date().optional(),
  paymentMethod: Joi.string().valid('virement', 'cheque', 'especes', 'carte').required(),
});

const actionSchema = Joi.object({
  client: Joi.string().required(),
  invoice: Joi.string().optional(),
  type: Joi.string().valid('appel', 'email', 'courrier', 'visite').required(),
  date: Joi.date().optional(),
  result: Joi.string().optional(),
  comment: Joi.string().optional(),
});

// Payload for updating a user (admin-only endpoint)
const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  role: Joi.string().valid('agent', 'manager', 'admin'),
  isActive: Joi.boolean(),
}).min(1);

// Common pagination/query helpers
const paginationQuery = {
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
};

// Query validation schemas
const clientListQuerySchema = Joi.object({
  search: Joi.string().optional(),
  ...paginationQuery,
});

const invoiceListQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'overdue', 'partial', 'paid').optional(),
  client: Joi.string().optional(),
  ...paginationQuery,
});

const paymentListQuerySchema = Joi.object({
  invoice: Joi.string().optional(),
});

const actionListQuerySchema = Joi.object({
  client: Joi.string().optional(),
  invoice: Joi.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  clientSchema,
  clientUpdateSchema,
  invoiceSchema,
  invoiceUpdateSchema,
  paymentSchema,
  actionSchema,
  userUpdateSchema,
  clientListQuerySchema,
  invoiceListQuerySchema,
  paymentListQuerySchema,
  actionListQuerySchema,
};