import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { RegisterDto } from 'src/auth/register.dto';
import * as bcrypt from 'bcrypt';
import { RecordDto } from './record.dto';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: UserRepository,
    ) {}

    async findUserById(id: string): Promise<User> {
        const user: User = await this.userRepository.findOne({ where: { userId: id } });
        if (user !== null) {
            return user;
        } else throw new Error('User not found');
    }

    async registerUser(registerDto: RegisterDto): Promise<User> {
        try {
            const { id, password } = registerDto;
            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = this.userRepository.create({
                userId: id,
                password: hashedPassword,
            } as User);
            const user = await this.userRepository.save(newUser);
            return user;
        } catch (error) {
            if (error.code === '23505') throw new ConflictException('Existing userName');
            else throw new InternalServerErrorException('from registerUser');
        }
    }

    async getRecords(userId: string): Promise<RecordDto> {
        const user: User = await this.findUserById(userId);
        const record: RecordDto = {
            id: user.userId,
            wins: user.wins,
            losses: user.losses,
        };
        return record;
    }
}
