import { UserRepository } from '../repositories/userRepository';
import { CreateUserInput, User } from '../types';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(userData: CreateUserInput): Promise<{ user: Omit<User, 'password_hash'>; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      password_hash,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Remove password hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; accessToken: string; refreshToken: string }> {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is OAuth user (no password)
    if (user.password_hash === 'oauth_user_no_password') {
      throw new Error('Please use OAuth to login');
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Remove password hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({ userId: payload.userId, email: payload.email });
    return { accessToken };
  }

  async handleOAuthLogin(email: string, name: string): Promise<{ user: Omit<User, 'password_hash'>; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOrCreateByOAuth(email, name);
    
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }
}

