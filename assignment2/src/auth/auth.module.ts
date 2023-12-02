import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwtAuth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([UserRepository]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: { expiresIn: '60m' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtService, JwtAuthGuard],
    exports: [JwtService, JwtAuthGuard],
})
export class AuthModule {}
