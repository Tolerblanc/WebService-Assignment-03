import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
    private logger = new Logger(AuthService.name);
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

    async login(loginDto: LoginDto): Promise<boolean> {
        this.logger.log('login() called');
        console.log(loginDto);
        return false;
    }

    async validateUser(id: string, password: string): Promise<any> {
        this.logger.log('validateUser() called');
        const user = await this.userService.findUserById(id);
        if (bcrypt.compare(password, user.password)) {
        }
        return null;
    }
}
