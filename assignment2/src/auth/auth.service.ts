import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
    private logger = new Logger(AuthService.name);
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

    async login(loginDto: LoginDto): Promise<string> {
        this.logger.log('login() called');
        try {
            await this.validateUser(loginDto.id, loginDto.password);
        } catch (e) {
            throw e;
        }
        const payload = { userId: loginDto.id };
        const newJwt: string = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET_KEY,
        });
        return newJwt;
    }

    async validateUser(id: string, password: string): Promise<void> {
        this.logger.log('validateUser() called');
        try {
            const user: User = await this.userService.findUserById(id);
            if ((await bcrypt.compare(password, user.password)) === true) {
                return;
            }
        } catch (e) {
            throw e;
        }
        throw new Error('password is invalid');
    }
}
