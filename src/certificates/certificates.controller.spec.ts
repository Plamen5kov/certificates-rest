import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { Certificate } from './entities/certificate.entity';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CertificatesController', () => {
  let certificatesController: CertificatesController;
  let certificatesService: CertificatesService;
  const mockGuard = { CanActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [
        CertificatesService,
        JwtAuthGuard,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Certificate),
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    certificatesService =
      moduleRef.get<CertificatesService>(CertificatesService);
    certificatesController = moduleRef.get<CertificatesController>(
      CertificatesController,
    );
  });

  describe('findAll', () => {
    it('should return expected type of result and should call findAll', async () => {
      const result = new Certificate();
      jest
        .spyOn(certificatesService, 'findAll')
        .mockImplementation(() => Promise.resolve([result]));

      expect(await certificatesController.findAllAvailable()).toContain(result);
    });
  });
});
