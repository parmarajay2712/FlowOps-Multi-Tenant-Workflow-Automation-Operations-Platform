import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import workflowRoutes from './routes/workflow.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import executionRoutes from './routes/execution.routes.js';
import dashboardRoutes from './routes/dashboard.js';
import searchRoutes from './routes/search.js';
import notificationsRoutes from './routes/notifications.js';
import apikeyRoutes from './routes/apikey.routes.js';
import auditRoutes from './routes/audit.routes.js';
import teamRoutes from './routes/team.routes.js';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/apikeys', apikeyRoutes);
app.use('/api/auditlogs', auditRoutes);
app.use('/api/team', teamRoutes);

// Swagger API Docs
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlowOps API',
      version: '1.0.0',
      description: 'API documentation for FlowOps Workflow Automation Platform',
    },
    servers: [{ url: '/api' }],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});
