import { IsNotEmpty } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    password: string;
}
