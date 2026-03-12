require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const clientRoutes = require('./routes/client.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const actionRoutes = require('./routes/action.routes');
const statsRoutes = require('./routes/stats.routes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Configuration EJS - moteur de template
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

// CORS — autorise le navigateur à contacter l'API
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/stats', statsRoutes);

// Routes Web (vues)
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/logout', (req, res) => {
  res.render('logout');
});

app.get('/', (req, res) => {
  res.render('dashboard');
});

app.get('/clients', (req, res) => {
  res.render('clients');
});

app.get('/clients/:id', (req, res) => {
  res.render('client-detail', { clientId: req.params.id });
});

app.get('/invoices', (req, res) => {
  res.render('invoices');
});

app.get('/invoices/:id', (req, res) => {
  res.render('invoice-detail', { invoiceId: req.params.id });
});

app.get('/users', (req, res) => {
  res.render('users');
});

app.get('/stats', (req, res) => {
  res.render('stats');
});

app.get('/actions', (req, res) => {
  res.render('actions');
});

app.get('/payments', (req, res) => {
  res.render('payments');
});

// Global error handler
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB connecté');
      app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
      console.log(`Documentation Swagger: http://localhost:${PORT}/api-docs`);
      console.log(`Interface Web: http://localhost:${PORT}`);
    })
    .catch((err) => {
      console.error('Erreur MongoDB:', err.message);
      process.exit(1);
    });
}

module.exports = app;