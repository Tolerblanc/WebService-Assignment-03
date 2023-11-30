import { Controller, Logger, Post } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @Post('login')
    login(): string {
        this.logger.log('endpoint /auth/login called');
        return this.authService.login();
    }

    @Post('register')
    register(): string {
        this.logger.log('endpoint /auth/register called');
        return this.userService.register();
    }
}
