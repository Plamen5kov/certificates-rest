import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Certificate } from './entities/certificate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate]), UsersModule],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService, TypeOrmModule],
})
export class CertificatesModule {}
