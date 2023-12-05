import { Controller, Logger, UseGuards, Get, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { RecordDto } from './record.dto';

@Controller('user')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(private userService: UserService) {}

    @Get('/records')
    @UseGuards(JwtAuthGuard)
    async getRecords(@Req() req, @Res() res): Promise<void> {
        this.logger.log('endpoint /user/records called');
        try {
            const userId: string = req.userId.userId;
            const records: RecordDto = await this.userService.getRecords(userId);
            res.status(200).send(records);
        } catch (e) {
            this.logger.error(e);
            res.status(401).send('Get records failed');
        }
    }
}
