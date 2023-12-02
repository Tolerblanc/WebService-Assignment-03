import { IsNotEmpty } from 'class-validator';

export class RecordDto {
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    wins: number;

    @IsNotEmpty()
    losses: number;
}
