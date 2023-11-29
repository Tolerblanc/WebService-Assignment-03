import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'user', schema: 'public' })
@Unique(['userId'])
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    userId: string;

    @Column()
    password: string;
}
