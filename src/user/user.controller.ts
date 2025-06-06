import { Controller, Get, Param, Put, Body, Delete, UseGuards,ParseIntPipe, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<User>
  ): Promise<User> {
    return this.userService.updateUserProfile(id, data);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.userService.deleteUser(id);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Patch('change-password')
  async changePassword(
      @Body() body: { userId: number; oldPassword: string; newPassword: string }
  ) {
      const { userId, oldPassword, newPassword } = body;
      return this.userService.changePassword(Number(userId), oldPassword, newPassword);
  }
}
