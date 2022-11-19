import { Certificate } from './src/certificates/entities/certificate.entity';
import { User } from './src/users/entities/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

export const options: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: 'password',
    entities: [
        User, 
        Certificate
    ],
    seeds: ['src/database/seeds/**/*{.ts,.js}'],
    factories: ['src/database/factories/**/*{.ts,.js}']
};

export const dataSource = new DataSource(options);
