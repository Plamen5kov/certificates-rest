<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

This project is done with [Nest](https://github.com/nestjs/nest)

This is a backend service with:
* login/register functionallyty operating with Local passport strategy (username / password). And once registered the JWT stratygey is enforced for some endpoints that need authorization.
* certificates that can be aquired by authenticated users and transferred by authenticated users

# Swagger

Swagger api is at: [localhost:3000/api](localhost:3000/api). You need to login and paste the authorization token in the top right. Once you are logged in, all authrorized endpoints are available for use.

I've also added a postman collection file `Certificates NEST.postman_collection` in the repository you can import and use once you have everything up and running.

## Installation

I've included the `.env` file for convenience.

**Prerequisites**

`docker` (20.10.21)

`docker compose`

`node` (v18.12.1)

1. Install all the necessary dependencies:
```bash
$ npm install
```

2. Create a docker volume named `data` and `testdata`. These volumes will hold our regular and test database respectivly.
```bash
docker volume create data
docker volume create testdata
```

3. start database:
```bash
docker compose up
```

## Running the app

```bash
#just run the app
$ docker compose up

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

>NOTE: Make sure to run either `npm run start` or `npm run start:dev` before running the `npm run seed`, because this will make a connection to the runningg postgres database and will create the tables based on the loaded entities in the configuration.

## Seed
I couldn't use [`typeorm-seed`](https://www.npmjs.com/package/typeorm-seed) becuase the [`typeorm`](https://www.npmjs.com/package/typeorm) library is version `0.3.x` and `typeorm-seed` library still does not support that version.
I found an alternative [`typeorm-extension`](https://www.npmjs.com/package/typeorm-extension) that works with `typeorm 0.3.x` but it was still in devlopment so not everything in the documentation works so I had to make some workarounds (check `setup.ts` file). I use a jest global setup to, setup the database and run the seed before the tests run. Once the database is created you can run the individual test command `npm run seed -- -d ./data-source-test.config.ts`.

```bash
# seed test database
npm run test:e2e //to setup test database and seed it and run tests afterwards

# seed main database
npm run seed //after you've started the application, so the tables are created
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
