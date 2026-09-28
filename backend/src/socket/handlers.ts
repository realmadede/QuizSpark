import { Server, Socket } from 'socket.io';
import { prisma } from '../prisma';
import { z } from 'zod';
import { checkQuota } from '../utils/quota';
import { extractToken, verifyToken } from '../utils/jwt';

/**
 * Initialize Socket.IO event handlers
 */

const joinSessionSchema = z.object({
  sessionId: z.string().uuid(),
  playerId: z.string().uuid(),
  token: z.string().uuid(),
});

const joinHostSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string().optional(),
});

const joinSpectatorSchema = z.object({
  sessionId: z.string().uuid(),
});

export function initializeSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Player connected:', socket.id);

    // Join session room
    socket.on('join_session', async (rawData) => {
      try {
        // Socket Rate Limiting (20 joins per minute per IP)
        const ip = socket.handshake.address;
        const { allowed } = await checkQuota(`socket_join:${ip}`, 20, 60 * 1000);
        if (!allowed) {
          socket.emit('error', 'Rate limit exceeded');
          return;
        }
        const data = joinSessionSchema.parse(rawData);
        // Verify player
        const player = await prisma.player.findUnique({
          where: { id: data.playerId },
        });

        if (!player || player.token !== data.token) {
          socket.emit('error', 'Unauthorized');
          return;
        }

        // Join room
        socket.join(`session:${data.sessionId}`);
        socket.data = { sessionId: data.sessionId, playerId: data.playerId };

        console.log(`Player ${data.playerId} joined session ${data.sessionId}`);

        // Mark player as connected
        await prisma.player.update({
          where: { id: data.playerId },
          data: { connected: true },
        });

        // Notify others
        socket.to(`session:${data.sessionId}`).emit('player_connected', {
          playerId: data.playerId,
        });
      } catch {
        console.error("Error occurred");
        socket.emit('error', 'Failed to join session');
      }
    });

    // Host joins session room
    socket.on('join_host', async (rawData) => {
      try {
        const data = joinHostSchema.parse(rawData);

        // Authenticate host via cookie or payload token
        const rawCookies = socket.request.headers.cookie || '';
        const cookieToken = rawCookies
          .split(';')
          .find((c) => c.trim().startsWith('token='))
          ?.split('=')[1];
        const authHeader = socket.handshake.headers.authorization;
        const token = cookieToken || (authHeader ? extractToken(authHeader as string) : data.token);

        if (!token) {
          socket.emit('error', 'Unauthorized');
          return;
        }

        const payload = verifyToken(token);
        if (!payload || payload.userId !== data.userId) {
          socket.emit('error', 'Unauthorized');
          return;
        }

        const session = await prisma.gameSession.findUnique({
          where: { id: data.sessionId },
        });

        if (!session || session.hostId !== data.userId) {
          socket.emit('error', 'Unauthorized');
          return;
        }

        socket.join(`session:${data.sessionId}:host`);
        socket.data = { sessionId: data.sessionId, userId: data.userId, isHost: true };

        console.log(`Host joined session ${data.sessionId}`);
      } catch {
        console.error("Error occurred");
        socket.emit('error', 'Failed to join session');
      }
    });

    // Spectator joins (projector mode)
    socket.on('join_spectator', async (rawData) => {
      try {
        const data = joinSpectatorSchema.parse(rawData);
        socket.join(`session:${data.sessionId}:spectator`);
        socket.data = { sessionId: data.sessionId, isSpectator: true };
        console.log(`Spectator joined session ${data.sessionId}`);
      } catch {
        socket.emit('error', 'Invalid spectator data');
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log('Player disconnected:', socket.id);

      if (socket.data?.playerId) {
        try {
          // Mark player as disconnected (but keep in session)
          await prisma.player.update({
            where: { id: socket.data.playerId },
            data: { connected: false },
          });

          // Notify others
          socket.to(`session:${socket.data.sessionId}`).emit('player_disconnected', {
            playerId: socket.data.playerId,
          });
        } catch {
          console.error("Error occurred");
        }
      }
    });

    socket.on('error', (_error) => {
      console.error("Socket error occurred");
    });
  });
}
