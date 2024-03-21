import express, { Request, Response } from 'express';
import dns from 'dns';
import mysql from 'mysql';
import dbConfig from './dbConfig';

const connection = mysql.createConnection(dbConfig);

const router = express.Router();
/**
 * @swagger
 * /v1/tools/lookup:
 *   get:
 *     summary: Resolve IPv4 addresses for the given domain
 *     tags: [Tools]
 *     parameters:
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         required: true
 *         description: The domain to resolve
 *         example: google.com
 *     responses:
 *       200:
 *         description: Successful response with resolved IPv4 addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 domain:
 *                   type: string
 *                   description: The input domain
 *                 ipv4Addresses:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The resolved IPv4 addresses for the domain
 */
router.get('/v1/tools/lookup', (req: Request, res: Response) => {
  // 获取查询参数中的域名
  const domain = req.query.domain as string;

  // 解析域名的 IPv4 地址
  dns.resolve4(domain, (err, addresses) => {
    if (err) {
      console.error('Error resolving domain:', err);
      res.status(500).json({ error: 'Failed to resolve domain' });
    } else {
      console.log('Resolved IPv4 addresses:', addresses);

      // 将查询结果记录到 MySQL 数据库      
      const query = 'INSERT INTO dns_queries (domain, ipv4_addresses, created_at) VALUES (?, ?, NOW())';
      const values = [domain, JSON.stringify(addresses)];

      connection.query(query, values, (error, results) => {
        if (error) {
          console.error('Error inserting query into MySQL database:', error);
        } else {
          console.log('Query inserted into MySQL database:', results.insertId);
        }
      });

      // 发送查询结果作为响应
      res.json({ domain, ipv4Addresses: addresses });
    }
  });
});

export default router;
