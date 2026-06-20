import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('oauth_clients')
export class Client {
    @PrimaryColumn()
    clientId: string;

    @Column()
    clientSecretHash: string;

    @Column('text', { array: true })
    redirectUris: string[];
}