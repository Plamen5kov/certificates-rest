import createMockInstance from 'jest-create-mock-instance';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CertificatesService } from './certificates.service';
import { Certificate, Status } from './entities/certificate.entity';
import { BadRequestException } from '@nestjs/common';
import { TransferCertificateDto } from './dto/transfer-certificate.dto';

describe('CertificatesService', () => {
  let service: CertificatesService;
  let mockCertificateRepository: Repository<Certificate>;
  let mockUserRepository: Repository<User>;
  let mockedUser: jest.Mocked<User>;
  let mockedCertificate: jest.Mocked<Certificate>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificatesService,
        {
          provide: getRepositoryToken(Certificate),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CertificatesService>(CertificatesService);
    mockCertificateRepository = module.get<Repository<Certificate>>(
      getRepositoryToken(Certificate),
    );
    mockUserRepository = module.get<Repository<User>>(getRepositoryToken(User));
    mockedUser = createMockInstance(User);
    mockedCertificate = createMockInstance(Certificate);
  });

  describe('aquireCertificate', () => {
    it('and make sure certificate status is changed to owned and then user is transferred and saved', async () => {
      mockedUser.certificates = [];
      mockedCertificate.status = Status.AVAILABLE;

      service.findOne = jest.fn().mockReturnValue(mockedCertificate);
      mockUserRepository.findOne = jest.fn().mockReturnValueOnce(mockedUser);
      mockUserRepository.save = jest.fn().mockReturnValue((x) => x);

      await service.aquireCertificate({
        userId: randomUUID(),
        certificateId: randomUUID(),
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockedCertificate.status).toBe(Status.OWNED);
      expect(mockedUser.certificates.length).toBeGreaterThanOrEqual(1);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockedUser);
    });

    it('and certificate is not found, and error is thrown', async () => {
      service.findOne = jest.fn().mockReturnValue(null);

      try {
        await service.aquireCertificate({
          userId: randomUUID(),
          certificateId: randomUUID(),
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('transferCertificate', () => {
    it('and an error is thrown when the userid and target user ids are the same', async () => {
      service.findOne = jest.fn().mockReturnValue(null);
      const fromUser = randomUUID();
      const tranferInfo = new TransferCertificateDto();
      tranferInfo.certificateId = randomUUID();
      tranferInfo.toUserId = fromUser;

      try {
        await service.transferCertificate(fromUser, tranferInfo);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect((e as BadRequestException).message).toBe(
          'No point in transferring your certificate back to yourself',
        );
      }
    });

    it('and an error is thrown when a target user cant be found', async () => {
      mockCertificateRepository.findOne = jest
        .fn()
        .mockReturnValueOnce(mockedCertificate);
      mockUserRepository.findOne = jest.fn().mockReturnValueOnce(null);

      const fromUser = randomUUID();
      const tranferInfo = new TransferCertificateDto();
      tranferInfo.certificateId = randomUUID();
      tranferInfo.toUserId = randomUUID();

      try {
        await service.transferCertificate(fromUser, tranferInfo);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect((e as BadRequestException).message).toMatch(
          /Didn't find any user with id/,
        );
      }
    });

    it('and an error is thrown when no eligible certificates are found to transfer', async () => {
      mockedCertificate.id = randomUUID();
      mockedCertificate.owner = createMockInstance(User);
      mockedCertificate.owner.id = randomUUID();
      mockCertificateRepository.findOne = jest
        .fn()
        .mockReturnValueOnce(mockedCertificate);
      mockUserRepository.findOne = jest.fn().mockReturnValueOnce(mockedUser);

      const fromUser = randomUUID();
      const tranferInfo = new TransferCertificateDto();
      tranferInfo.certificateId = randomUUID();
      tranferInfo.toUserId = randomUUID();
      try {
        await service.transferCertificate(fromUser, tranferInfo);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect((e as BadRequestException).message).toMatch(
          /No certificates found for transfer. Make sure you own this certificate/,
        );
      }
    });

    it('and if everything is ok a certificate is transferred to new owner and status is changed', async () => {
      const fromUser = randomUUID();
      mockedCertificate.id = randomUUID();
      mockedCertificate.owner = createMockInstance(User);
      mockedCertificate.owner.id = fromUser;
      mockedUser.certificates = [];
      const tranferInfo = new TransferCertificateDto();
      tranferInfo.certificateId = mockedCertificate.id;
      tranferInfo.toUserId = randomUUID();

      mockCertificateRepository.findOne = jest
        .fn()
        .mockReturnValueOnce(mockedCertificate);
      mockUserRepository.findOne = jest.fn().mockReturnValueOnce(mockedUser);
      mockUserRepository.save = jest.fn();

      await service.transferCertificate(fromUser, tranferInfo);

      expect(mockedCertificate.status).toBe(Status.TRANSFERRED);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockedUser);
    });
  });

  describe('findAll', () => {
    it('and only available is true filter is correct', async () => {
      mockCertificateRepository.find = jest.fn();

      await service.findAll({ available: true });

      expect(mockCertificateRepository.find).toHaveBeenCalledTimes(1);
      expect(mockCertificateRepository.find).toHaveBeenCalledWith({
        where: { status: Status.AVAILABLE },
      });
    });

    it('and only available is false filter is correct', async () => {
      mockCertificateRepository.find = jest.fn();

      await service.findAll({ available: false });

      expect(mockCertificateRepository.find).toHaveBeenCalledTimes(1);
      expect(mockCertificateRepository.find).toHaveBeenCalledWith({
        where: { status: expect.any(Object) },
      });
    });

    it('and only userId is passed filter is correct', async () => {
      mockCertificateRepository.find = jest.fn();
      const findUserId = randomUUID();

      await service.findAll({ userId: findUserId });

      expect(mockCertificateRepository.find).toHaveBeenCalledTimes(1);
      expect(mockCertificateRepository.find).toHaveBeenCalledWith({
        where: {
          owner: { id: findUserId },
          status: expect.any(Object),
        },
      });
    });

    it('and userId and available params are passed filter is correct', async () => {
      mockCertificateRepository.find = jest.fn();
      const findUserId = randomUUID();

      await service.findAll({ userId: findUserId, available: true });

      expect(mockCertificateRepository.find).toHaveBeenCalledTimes(1);
      expect(mockCertificateRepository.find).toHaveBeenCalledWith({
        where: {
          owner: { id: findUserId },
          status: Status.AVAILABLE,
        },
      });
    });
  });

  describe('create', () => {
    it('calls repository save with passed dto', async () => {
      mockCertificateRepository.save = jest.fn();
      const param = { country: 'Bulgaria' };

      await service.create(param);

      expect(mockCertificateRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
