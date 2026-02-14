import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { RedisService } from '../cache/redis.service'

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = this.getClientIp(req)
    const key = `rate_limit:${ip}`

    try {
      // Get current request count
      const current = await this.redisService.get(key)
      const count = current ? parseInt(current) : 0

      // Rate limit: 100 requests per minute
      const limit = 100
      const window = 60 // seconds

      if (count >= limit) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            retryAfter: window,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        )
      }

      // Increment counter
      if (count === 0) {
        await this.redisService.set(key, '1', window)
      } else {
        await this.redisService.incr(key)
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.toString())
      res.setHeader('X-RateLimit-Remaining', (limit - count - 1).toString())
      res.setHeader('X-RateLimit-Reset', (Date.now() + window * 1000).toString())

      next()
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      // If Redis fails, allow the request (fail open)
      next()
    }
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown'
    )
  }
}
