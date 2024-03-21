import express, { Request, Response } from 'express';
import { Counter, register, collectDefaultMetrics } from 'prom-client';
import os from 'os';
import lookupRouter from './lookup';
import historyRouter from './history';
import validateRouter from './validate';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';

// 环境变量
dotenv.config();
const port = 3000;
// 创建 Express 应用程序
const app = express();
app.use(express.json()); // 解析 JSON 格式的请求主体
// 创建一个可写流，用于将日志写入到文件中
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
// 使用 'combined' 格式记录访问日志，并将日志写入到文件中
app.use(morgan('combined', { stream: accessLogStream }));

// 启用默认的 Prometheus 指标收集
collectDefaultMetrics();
// 创建一个Prometheus计数器指标
const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status']
});
// 创建一个计数器指标，用于记录健康检查的次数
const healthCheckCounter = new Counter({
  name: 'health_checks_total',
  help: 'Total number of health checks performed',
});
// 监听所有请求，增加计数器值
app.use((req: Request, res: Response, next: Function) => {
  httpRequestCounter.inc({ method: req.method, status: res.statusCode });
  next();
});

// 将 `/metrics` 路径绑定到 Prometheus 指标注册器
app.get('/metrics', (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  register.metrics().then(metrics => {
    res.end(metrics.toString());
  }).catch(err => {
    console.error('Failed to retrieve metrics:', err);
    res.status(500).send('Failed to retrieve metrics');
  });
});

// 健康检查端点
app.get('/health', (req: Request, res: Response) => {
  // 检查应用程序的状态，这里假设应用程序处于正常运行状态
  const appStatus = 'ok';

  // 健康检查计数器加一
  healthCheckCounter.inc();

  // 返回健康检查的信息
  res.json({
    status: appStatus,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    hostname: os.hostname(),
  });
});

// 定义 Swagger 配置
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Coding Challenge API with Swagger',
      version: '1.0.0',
      description: 'Coding Challenge API with Swagger documentation',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['src/**/*.ts'], // 指定要扫描的源代码文件，根据文件中的注释生成 Swagger 文档
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * @swagger
 * tags:
 *   - name: Root
 *     description: Operations related to root
 *   - name: Tools
 *     description: Operations related to tools
 */

// 根路由，返回当前日期（UNIX 时间戳）、版本和 Kubernetes 属性
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get current date, version, and Kubernetes status
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: Successful response with current date, version, and Kubernetes status
 */

app.get('/', (req: Request, res: Response) => {
  const currentDate = Math.floor(Date.now() / 1000); // 获取当前时间的 UNIX 时间戳
  const version = '0.1.0'; // 版本号
  const isRunningUnderKubernetes = process.env.KUBERNETES === 'true'; // 检查是否在 Kubernetes 下运行

  const responseData = {
    version,
    date: currentDate,
    kubernetes: isRunningUnderKubernetes,
  };

  res.json(responseData);
});

// 设置 Swagger UI 路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 设置其他路由
app.use(lookupRouter);
app.use(historyRouter);
app.use(validateRouter);

// 启动 Express 服务器
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  console.log(`Swagger UI is running on http://localhost:${port}/api-docs`);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing server gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Closing server gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});