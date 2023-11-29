import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);
    constructor(private readonly appService: AppService) {}

    @Get()
    getHome(): string {
        this.logger.log('endpoint / called');
        return this.appService.getFileStreamHome();
    }

    @Get('login')
    getLogin(): string {
        this.logger.log('endpoint /login called');
        return this.appService.getFileStreamLogin();
    }

    @Get('register')
    getRegister(): string {
        this.logger.log('endpoint /register called');
        return this.appService.getFileStreamRegister();
    }
}
