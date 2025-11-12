import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Middleware de autenticação via API Key
 */
export function requireApiKey(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API Key inválida ou ausente'
      });
    }

    return handler(req, res);
  };
}

/**
 * Middleware de rate limiting (simples)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  ) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const clientId = req.headers['x-api-key'] as string || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      
      const record = requestCounts.get(clientId);
      
      if (!record || now > record.resetTime) {
        requestCounts.set(clientId, {
          count: 1,
          resetTime: now + windowMs
        });
      } else {
        record.count++;
        
        if (record.count > maxRequests) {
          return res.status(429).json({
            error: 'Too Many Requests',
            message: `Limite de ${maxRequests} requisições por minuto excedido`
          });
        }
      }

      return handler(req, res);
    };
  };
}
