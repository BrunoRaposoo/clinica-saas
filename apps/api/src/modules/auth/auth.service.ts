import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../common/prisma.service';
import { MockEmailService } from '../../common/interfaces/email.interface';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { LoginResponsePayload, AuthUserResponse, TokenPayload } from '@clinica-saas/contracts';

@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_EXPIRY = 900;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;
  private readonly PASSWORD_RESET_EXPIRY_HOURS = 1;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: MockEmailService,
  ) {}

  private get jwtSecret(): string {
    return this.configService.get('JWT_SECRET') || 'dev-secret-change-in-production-minimum-32-chars';
  }

  async login(dto: LoginDto): Promise<LoginResponsePayload> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { 
        role: true,
        organization: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const authUser: AuthUserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      user: authUser,
    };
  }

  async register(dto: RegisterDto): Promise<LoginResponsePayload> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso.');
    }

    const defaultRole = await this.prisma.role.findFirst({
      where: { name: 'support' },
    });

    const hashedPassword = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        organizationId: dto.organizationId,
        roleId: defaultRole?.id || '00000000-0000-0000-0000-000000000001',
      },
      include: { 
        role: true,
        organization: true,
      },
    });

    const { accessToken, refreshToken } = await this.generateTokens(user);

    const authUser: AuthUserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      user: authUser,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!storedToken || storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token inválido ou revogado.');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expirado.');
    }

    const payload: TokenPayload = {
      sub: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
      organizationId: storedToken.user.organizationId || undefined,
      roleId: storedToken.user.roleId,
      roleName: storedToken.user.role.name,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_EXPIRY,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret);

    return {
      accessToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    };
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      return { success: true, message: 'Se o email existir, um link de recuperação foi enviado.' };
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + this.PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetLink = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/reset-password/${token}`;
    
    await this.emailService.send(
      user.email,
      'Recuperação de Senha',
      `Clique no link para redefinir sua senha: ${resetLink}\n\nEste link expira em ${this.PASSWORD_RESET_EXPIRY_HOURS} hora(s).`,
    );

    return { success: true, message: 'Se o email existir, um link de recuperação foi enviado.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Token de redefinição inválido.');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('Token de redefinição já foi utilizado.');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Token de redefinição expirado.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, this.BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId },
      data: { revokedAt: new Date() },
    });

    return { success: true, message: 'Senha redefinida com sucesso.' };
  }

  async validateToken(token: string): Promise<AuthUserResponse> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as TokenPayload;

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuário inativo ou não encontrado.');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        roleId: user.roleId,
        roleName: user.role.name,
      };
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const jti = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId || undefined,
      roleId: user.roleId,
      roleName: user.role.name,
      jti,
      iat: now,
      exp: now + this.ACCESS_TOKEN_EXPIRY,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret);

    const refreshTokenExpires = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const refreshToken = uuidv4();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpires,
      },
    });

    return { accessToken, refreshToken };
  }
}