import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserProfile(userId: number, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return user;
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'User deleted successfully' };
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
