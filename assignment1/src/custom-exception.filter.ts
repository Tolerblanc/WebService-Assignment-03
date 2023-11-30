import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Catch()
export class CustomExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(CustomExceptionsFilter.name);
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const status = exception instanceof HttpException ? exception.getStatus() : 500;

        if (exception instanceof Error && exception.message.includes('ENOENT')) {
            this.logger.error(`redirect to 404 page. reason - ${exception.message}`);
            response.status(404).sendFile(join(__dirname, '..', 'public', '404.html'));
        } else if (exception instanceof Error && status === 401) {
            this.logger.error(`redirect to lgoin page. reason - ${exception.message}`);
            response.status(401).sendFile(join(__dirname, '..', 'public', 'login.html'));
        } else {
            this.logger.error(exception instanceof Error ? exception.stack : exception);
            response.status(status).json({
                statusCode: status,
                message: exception instanceof Error ? exception.message : 'Internal Server Error',
            });
        }
    }
}
