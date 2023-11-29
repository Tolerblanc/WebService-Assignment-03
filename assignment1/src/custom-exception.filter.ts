import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Catch()
export class CustomExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const status = exception instanceof HttpException ? exception.getStatus() : 500;

        if (exception instanceof Error && exception.message.includes('ENOENT')) {
            response.status(404).sendFile(join(__dirname, '..', 'public', '404.html'));
        } else {
            response.status(status).json({
                statusCode: status,
                message: exception instanceof Error ? exception.message : 'Internal Server Error',
            });
        }
    }
}
