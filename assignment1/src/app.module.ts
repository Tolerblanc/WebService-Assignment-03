import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env`,
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: +process.env.DB_PORT,
            username: process.env.MYSQL_USER_ID,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.DB_NAME,
            entities: [],
            synchronize: true,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            renderPath: undefined,
        }),
        UserModule,
    ],
    controllers: [AppController, UserController],
    providers: [AppService],
})
export class AppModule {}
