import { Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'user', schema: 'public' })
@Unique(['userId'])
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    @Length(4, 20)
    userId: string;

    @Column()
    password: string;

    @Column({ default: 0 })
    wins: number;

    @Column({ default: 0 })
    losses: number;
}
