import express, { Request, Response } from 'express';
import { isIPv4 } from 'net'; // 从 'net' 模块中导入 isIPv4 函数

const router = express.Router();
/**
 * @swagger
* /v1/tools/validate:
 *   post:
 *     summary: Validate IPv4 address
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ipAddress:
 *                 type: string
 *                 format: ipv4
 *             required:
 *               - ipAddress
 *     responses:
 *       200:
 *         description: Successful response with validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ipAddress:
 *                   type: string
 *                   description: The input IPv4 address
 *                 isValidIPv4:
 *                   type: boolean
 *                   description: Indicates whether the input is a valid IPv4 address
 */
router.post('/v1/tools/validate', (req: Request, res: Response) => {    
  // 从请求主体中获取要验证的 IPv4 地址
  const ipAddress = req.body.ipAddress as string;

  // 验证输入是否为有效的 IPv4 地址
  const isValidIPv4 = isIPv4(ipAddress);

  // 准备响应数据
  const responseData = {
    ipAddress,
    isValidIPv4,
  };

  // 发送响应
  res.json(responseData);
});

export default router;
