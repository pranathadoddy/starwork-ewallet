import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createSession(
    userId: string,
    token: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<Session> {
    // Deactivate all existing sessions for this user (SSO implementation)
    await this.deactivateUserSessions(userId);

    // Create new session
    const session = this.sessionRepository.create({
      userId,
      token,
      isActive: true,
      deviceInfo,
      ipAddress,
      lastUsedAt: new Date(),
    });

    return this.sessionRepository.save(session);
  }

  async deactivateUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.update(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  async validateSession(token: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: { token, isActive: true },
      relations: ['user'],
    });

    if (session) {
      // Update last used timestamp
      session.lastUsedAt = new Date();
      await this.sessionRepository.save(session);
    }

    return session;
  }

  async deactivateSession(token: string): Promise<void> {
    await this.sessionRepository.update(
      { token },
      { isActive: false }
    );
  }

  async getUserActiveSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastUsedAt: 'DESC' },
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    // Clean up sessions older than 24 hours
    const expiredDate = new Date();
    expiredDate.setHours(expiredDate.getHours() - 24);

    await this.sessionRepository.update(
      { 
        isActive: true,
        lastUsedAt: { $lt: expiredDate } as any
      },
      { isActive: false }
    );
  }
}
