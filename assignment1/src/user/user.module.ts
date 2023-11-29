import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([UserRepository]),
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [UserService, JwtAuthGuard, UserRepository],
    controllers: [UserController],
    exports: [UserService, UserRepository],
})
export class UserModule {}
