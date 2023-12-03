import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [UserModule, TypeOrmModule.forFeature([User])],
    providers: [SocketGateway, SocketService, JwtService],
    exports: [SocketGateway],
})
export class SocketModule {}