import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwtAuth.guard';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);
    constructor(private readonly appService: AppService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    getHome(@Req() req): string {
        this.logger.log('endpoint / called');
        return this.appService.getFileStreamHome();
    }

    @Get('login')
    getLogin(): string {
        this.logger.log('endpoint /login called');
        return this.appService.getFileStreamLogin();
    }

    @Get('join')
    getRegister(): string {
        this.logger.log('endpoint /join called');
        return this.appService.getFileStreamRegister();
    }

    @Get('record')
    @UseGuards(JwtAuthGuard)
    getRecord(): string {
        this.logger.log('endpoint /record called');
        return this.appService.getFileStreamRecord();
    }
}
