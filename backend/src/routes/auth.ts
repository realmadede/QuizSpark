import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../prisma';
import { generateToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { authLimiter, tokenLimiter } from '../middleware/rate-limit';
import { sendPasswordResetEmail, sendEmailVerification } from '../utils/mailer';

const router = Router();

// Helper for hashing tokens
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

// Set cookie helper
const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Sign up
router.post('/sign-up', authLimiter, async (req: Request, res: Response) => {
  try {
    const data = signUpSchema.parse(req.body);

    // Check if user exists
    const existing = await prisma.profile.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.profile.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
      },
    });

    // Create teacher role by default
    await prisma.userRole.create({
      data: {
        userId: user.id,
        role: 'teacher',
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });
    setTokenCookie(res, token);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    return res.status(500).json({ error: 'Failed to sign up' });
  }
});

// Sign in
router.post('/sign-in', authLimiter, async (req: Request, res: Response) => {
  try {
    const data = signInSchema.parse(req.body);

    // Find user
    const user = await prisma.profile.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      console.warn(
        `[SECURITY - FAILED LOGIN] Attempt with non-existent email. IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      console.warn(
        `[SECURITY - FAILED LOGIN] Invalid password for user ID: ${user.id}. IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });
    setTokenCookie(res, token);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    return res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Get current user
// Logout
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    await prisma.profile.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
    res.clearCookie('token');
    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to log out' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.profile.findUnique({
      where: { id: req.user!.userId },
      include: {
        userRoles: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.userRoles.map((ur) => ur.role),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
});

const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
});

// Update current user
router.put('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const currentUser = await prisma.profile.findUnique({ where: { id: req.user!.userId } });

    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const updateData: Record<string, string | null | Date> = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;

    let emailVerificationSent = false;

    // If the email is changing, we don't update it directly. Instead, set pendingEmail and send verification.
    if (data.email && data.email !== currentUser.email) {
      // Check if new email is already in use
      const existing = await prisma.profile.findUnique({ where: { email: data.email } });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      updateData.pendingEmail = data.email;
      updateData.emailVerificationToken = hashToken(rawToken);
      updateData.emailVerificationTokenExpiresAt = new Date(Date.now() + 3600000);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const verifyLink = `${frontendUrl}/verify-email?token=${rawToken}`;
      await sendEmailVerification(data.email, verifyLink);
      emailVerificationSent = true;
    }

    const user = await prisma.profile.update({
      where: { id: req.user!.userId },
      data: updateData,
    });

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      emailVerificationSent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

// Verify email
router.post('/verify-email', tokenLimiter, async (req: Request, res: Response) => {
  try {
    const data = verifyEmailSchema.parse(req.body);

    const user = await prisma.profile.findFirst({
      where: {
        emailVerificationToken: hashToken(data.token),
        emailVerificationTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user || !user.pendingEmail) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    // Double check if pending email is still available (someone else could have registered it)
    const existing = await prisma.profile.findUnique({ where: { email: user.pendingEmail } });
    if (existing) {
      return res.status(409).json({ error: 'Email has already been taken by another user' });
    }

    await prisma.profile.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        pendingEmail: null,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    return res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
});

export default router;

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

// Forgot password
router.post('/forgot-password', tokenLimiter, async (req: Request, res: Response) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const user = await prisma.profile.findUnique({ where: { email: data.email } });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour

      await prisma.profile.update({
        where: { id: user.id },
        data: { resetToken: hashToken(rawToken), resetTokenExpiresAt },
      });

      // Usually it's better to use FRONTEND_URL or deriving it from req
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail(user.email, resetLink);
    }

    // Always return success to prevent email enumeration
    return res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error);
    return res
      .status(500)
      .json({ error: 'Service temporarily unavailable, please try again later.' });
  }
});

// Reset password
router.post('/reset-password', tokenLimiter, async (req: Request, res: Response) => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    const user = await prisma.profile.findFirst({
      where: {
        resetToken: hashToken(data.token),
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.profile.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
        tokenVersion: { increment: 1 },
      },
    });

    return res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});
