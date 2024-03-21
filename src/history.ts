import express, { Request, Response } from 'express';
import mysql from 'mysql';
import dbConfig from './dbConfig';

const connection = mysql.createConnection(dbConfig);

const router = express.Router();

/**
 * @swagger
 * /v1/history:
 *   get:
 *     summary: Retrieve the latest 20 saved queries from the database
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: Successful response with latest 20 saved queries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     description: The ID of the query
 *                   domain:
 *                     type: string
 *                     description: The domain of the query
 *                   ipv4Addresses:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: The resolved IPv4 addresses for the domain
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: The creation timestamp of the query
 */
router.get('/v1/history', (req: Request, res: Response) => {
  // 查询最近保存的 20 条查询记录
  const query = 'SELECT * FROM dns_queries ORDER BY created_at DESC LIMIT 20';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error retrieving queries from MySQL database:', error);
      res.status(500).json({ error: 'Failed to retrieve queries from database' });
    } else {
      console.log('Retrieved queries from MySQL database:', results);

      // 发送查询结果作为响应
      res.json(results);
    }
  });
});

export default router;
