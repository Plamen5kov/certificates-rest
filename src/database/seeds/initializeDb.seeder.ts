import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import {
  Certificate,
  Status,
} from '../../logic/certificates/entities/certificate.entity';
import { User } from '../../logic/users/entities/user.entity';

export default class InitializeDb implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const certificateFactory = factoryManager.get(Certificate);
    const userFactory = factoryManager.get(User);
    const repository = dataSource.getRepository(User);

    //generate test users with known passwords and usernames
    const generatedUsers = await Promise.all(
      Array.from({ length: 5 }, (_, i) => i + 1).map(async (n) => {
        const newUser = new User({
          username: `plamen${n}`,
          password: 'password',
        });
        return await repository.save(newUser);
      }),
    );

    //generate certificates owned by the test users
    generatedUsers.forEach(async (u) => {
      await certificateFactory.saveMany(10, { owner: u, status: Status.OWNED });
    });

    //generate random certificates
    await certificateFactory.saveMany(50);

    //generate users with no certificates
    await userFactory.saveMany(5);
  }

  private getNextAvailableBatchOfCertificates(
    allCerts: Certificate[],
    startIndex: number,
    length: number,
  ): Certificate[] {
    const certs = allCerts.slice(startIndex, startIndex + length);
    return certs;
  }
}
