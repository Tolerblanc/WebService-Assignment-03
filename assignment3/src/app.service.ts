import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    getFileStreamHome(): string {
        this.logger.log('getFileStreamHome called');
        return fs.readFileSync(join(__dirname, '..', 'public', 'index.html'), 'utf8');
    }

    getFileStreamLogin(): string {
        this.logger.log('getFileStreamLogin called');
        return fs.readFileSync(join(__dirname, '..', 'public', 'login.html'), 'utf8');
    }

    getFileStreamRegister(): string {
        this.logger.log('getFileStreamRegister called');
        return fs.readFileSync(join(__dirname, '..', 'public', 'register.html'), 'utf8');
    }

    getFileStreamRecord(): string {
        this.logger.log('getFileStreamRegister called');
        return fs.readFileSync(join(__dirname, '..', 'public', 'record.html'), 'utf8');
    }
}
