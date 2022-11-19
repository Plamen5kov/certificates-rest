import { User } from '../../../src/users/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(User, (faker) => {
  const user = new User({
    username: faker.name.firstName('male'),
    password: faker.internet.password(),
  });

  return user;
});
