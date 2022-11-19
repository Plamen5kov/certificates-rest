import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Certificate, Status } from './entities/certificate.entity';
import { CertificateFilters } from './dto/certificate-filters.dto';
import { User } from '../../src/users/entities/user.entity';

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createCertificateDto: CreateCertificateDto) {
    return await this.certificateRepository.save(createCertificateDto);
  }

  async aquireCertificate(userId: string, certificateId: string) {
    this.logger.log(`Aquiring certificate ${certificateId}`);

    const certificate = await this.findOne(certificateId);
    if (certificate && certificate.status === Status.AVAILABLE) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['certificates'],
      });

      user.certificates.push(certificate);
      certificate.status = Status.OWNED;

      return await this.usersRepository.save(user);
    } else {
      const message = `Could not find available certificate with id ${certificateId}`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }
  }

  async transferCertificate(
    fromUserId: string,
    toUserId: string,
    certificateId: string,
  ) {
    this.logger.log(
      `Transferring certificate ${certificateId} from user ${fromUserId} to user ${toUserId}`,
    );

    if (fromUserId === toUserId) {
      const message = `No point in transferring your certificate back to yourself`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }

    const myCertificates = await this.findAll({
      userId: fromUserId,
    });
    const certificatesToTransfer = myCertificates.filter(
      (c) => c.id === certificateId,
    );

    const toUser = await this.usersRepository.findOne({
      where: { id: toUserId },
      relations: ['certificates'],
    });

    if (!toUser) {
      const message = `Didn't find any user with id ${toUserId}`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }

    if (certificatesToTransfer.length > 0) {
      const certificateToTransfer = certificatesToTransfer[0];
      toUser.certificates.push(certificateToTransfer);
      certificateToTransfer.status = Status.TRANSFERRED;
      return await this.usersRepository.save(toUser);
    } else {
      const message = `No certificates found for transfer. Make sure you own this certificate: ${certificateId}`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }
  }

  findAll(filters: Partial<CertificateFilters>): Promise<Certificate[]> {
    this.logger.log(
      `Find all certificates with filter ${JSON.stringify(filters)}`,
    );
    const where = {};
    Object.assign(
      where,
      filters.available
        ? { status: Status.AVAILABLE }
        : { status: In([Status.OWNED, Status.TRANSFERRED]) },
    );
    Object.assign(
      where,
      filters.userId ? { owner: { id: filters.userId } } : {},
    );

    return this.certificateRepository.find({ where });
  }

  findOne(id: string) {
    this.logger.log(`Find one certificate with id: ${id}`);
    return this.certificateRepository.findOneBy({ id });
  }
}
