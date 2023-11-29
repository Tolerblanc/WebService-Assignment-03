import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return fs.readFileSync(join(__dirname, '..', 'public', 'home.html'), 'utf8');
    }

    @Get('login')
    getLogin(): string {
        return fs.readFileSync(join(__dirname, '..', 'public', 'login.html'), 'utf8');
    }

    @Get('register')
    getRegister(): string {
        return fs.readFileSync(join(__dirname, '..', 'public', 'register.html'), 'utf8');
    }
}
