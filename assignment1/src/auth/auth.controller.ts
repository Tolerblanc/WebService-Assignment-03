import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res): Promise<void> {
        this.logger.log('endpoint /auth/login called');
        try {
            const newJwt: string = await this.authService.login(loginDto);
            if (loginDto.isSession !== undefined) {
                res.cookie('access_token', newJwt, { expires: 0 });
            } else {
                res.cookie('access_token', newJwt, { expires: process.env.JWT_ACCESS_EXPIRATION_TIME });
            }
            res.redirect('/');
        } catch (e) {
            res.status(401).send('Login failed');
        }
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res() res) {
        this.logger.log('endpoint /auth/register called');
        try {
            await this.userService.registerUser(registerDto);
            res.status(200).redirect('/');
        } catch (e) {
            res.status(409).send('User already exists');
        }
    }

    @Post('checkDuplication')
    async checkDuplication(@Body('id') id: string, @Res() res): Promise<void> {
        this.logger.log('endpoint /auth/checkDuplication called');
        try {
            await this.userService.findUserById(id);
            res.status(409).send('User already exists');
        } catch (e) {
            res.status(200).send('User does not exist');
        }
    }
}
