# RESTful Service

> RESTful Service

<!-- GETTING STARTED -->

## Installing / Getting started

- You must be a member and added ssh key of workspace on bitbucket/gitlab. Clone the repo

```sh
git clone
```

## Development setup

### Built With

- Framework ExpressJS v4.
- Validation API with Joi and fastest validator.
- Validate and generate default config environment.
- Authenticate JSON Web Token and auto refresh token in header.
- Handle permission user when calling API.
- Storage data on MongoDB.
- Data Source built with Apollo datasource and Dataloader.
- Caching result with Redis.
- Logging in winston.
- Documentation with Swagger.
- Compiler with Babel ES6.
- Auto create the first user (username: "admin", password: "123456)

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

- NodeJS v14.4.x to up

- MongoDB v4.x

- Redis v5.x

### Setting up

Follow all step bellow to setup your dev environment

1. Setup as `Installing / Getting started`

2. Start your environment (We are using Docker for environment setup)

3. Setup environment variables.
   Create environment config file and config `mongo`, `rabbitmq` and `redis` connection params

   Generate secret token: `head -n 4096 /dev/urandom | openssl sha1`
   Paste the result into JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET in .env file

```sh
cp .env.example .env
```

4. Install NPM packages

```sh
yarn install
```

5. Run development:

```sh
yarn dev
```

You can start via docker compose

```sh
docker-compose up
```

### Building

Test your code before build.

```shell
$ yarn test:coverage
```

Run build command

```shell
$ yarn build
```

### Deploying / Publishing

Push your code to your branch with format `[__YOUR_USERNAME__]/[__FEATURE__]`

```shell
$ git add .
$ git commit -m "__COMMIT_MESSAGE__"
$ git push origin [__YOUR_USERNAME__]/[__FEATURE__]
```

Then go to repository server and make a pull request to branch `development`.

**IMPORTANT**: Don't push anything to `master` by yourself. A CI tool will run all step and merge to `master` for you.

## Production setup

- Install dependencies in production

```sh
yarn install --production=true
```

## Documentation

- Using swagger doc
- Document: http://localhost:9000/documentation
- Health Check: http://localhost:9000/health

## Configuration

On `.env`, you must config all environment variables bellow. By default, `.env.example` is used default config for all service.

## Tests

The test library is [Jest](https://github.com/facebook/jest).

- All test files must be located on `__tests__` and naming by format `[name].spec.js`

- The folders/files on `__tests__` must be as same as on `src` folder.

Just test

```sh
 yarn test
```

Test a file

```sh
 yarn test path/to/test/file
```

Test with coverage information

```sh
 yarn test:coverage
```

## Versioning

- [Current] `beta`: All code is on `master`

- v1.0.0

## Licensing

Dev Team – [@DEV](dev@kompa.ai) – dev@kompa.ai
