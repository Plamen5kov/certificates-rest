import { setSeederFactory } from 'typeorm-extension';
import { Certificate } from '../../../src/certificates/entities/certificate.entity';

export default setSeederFactory(Certificate, (faker) => {
  const certificate = new Certificate();
  certificate.country = faker.address.country();

  return certificate;
});
