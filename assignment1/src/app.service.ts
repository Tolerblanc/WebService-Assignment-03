import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
@Injectable()
export class AppService {
    getFileStreamHome(): string {
        return fs.readFileSync(join(__dirname, '..', 'public', 'home.html'), 'utf8');
    }

    getFileStreamLogin(): string {
        return fs.readFileSync(join(__dirname, '..', 'public', 'login.html'), 'utf8');
    }

    getFileStreamRegister(): string {
        return fs.readFileSync(join(__dirname, '..', 'public', 'register.html'), 'utf8');
    }
}
