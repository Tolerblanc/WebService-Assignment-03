import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // 전체적으로 사용하기 위해
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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
