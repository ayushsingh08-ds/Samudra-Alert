import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env, allowedOrigins } from '../config/env';

let io: Server | null = null;

interface TokenPayload {
  userId: string;
  role: string;
}

export function initRealtime(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // JWT handshake auth
  io.use((socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string) ||
        (socket.handshake.headers.authorization?.split(' ')[1] as string);

      if (!token) {
        // Allow anonymous read-only clients (public feed)
        (socket.data as { userId?: string }).userId = undefined;
        return next();
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
      socket.data = { userId: decoded.userId, role: decoded.role };
      next();
    } catch {
      // Invalid token: continue as anonymous
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    // Everyone gets the global feed
    socket.join('global');

    socket.on('region:join', (region: string) => {
      if (typeof region === 'string' && region.length < 40) {
        socket.join(`region:${region}`);
      }
    });

    socket.on('region:leave', (region: string) => {
      if (typeof region === 'string' && region.length < 40) {
        socket.leave(`region:${region}`);
      }
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}

/** Emit a verified report to global + its region room. */
export function emitReportCreated(report: unknown, region: string): void {
  io?.to('global').emit('report:created', report);
  io?.to(`region:${region}`).emit('report:created', report);
}

/** Emit status updates (verified/rejected/resolved) to global + region. */
export function emitReportUpdated(report: unknown, region: string): void {
  io?.to('global').emit('report:updated', report);
  io?.to(`region:${region}`).emit('report:updated', report);
}

/** Broadcast a new alert to global + target region rooms. */
export function emitAlertBroadcast(alert: unknown): void {
  io?.to('global').emit('alert:broadcast', alert);
}
