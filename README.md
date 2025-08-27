<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# OPProject - Product Management System

Bu dastur mahsulotlar, mijozlar va foydalanuvchilarni boshqarish uchun yaratilgan NestJS API.

## Features

- **Authentication**: JWT token bilan login/register
- **User Management**: Foydalanuvchilarni boshqarish (CRUD)
- **Product Management**: Mahsulotlarni boshqarish (CRUD)
- **Client Management**: Mijozlarni boshqarish (CRUD)
- **Database**: Prisma ORM bilan SQLite

## Installation

```bash
# Dependencies o'rnatish
yarn install

# Database migration
npx prisma migrate dev

# Dasturni ishga tushirish
yarn start:dev
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "login": "johndoe",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "login": "johndoe",
  "password": "password123"
}
```

### Users (Authentication required)

#### Get All Users
```http
GET /users
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

#### Create User
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "login": "janesmith",
  "password": "password123"
}
```

#### Update User
```http
PATCH /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Johnson"
}
```

#### Delete User
```http
DELETE /users/:id
Authorization: Bearer <token>
```

### Products (Authentication required)

#### Get All Products
```http
GET /products
Authorization: Bearer <token>
```

#### Get Product by ID
```http
GET /products/:id
Authorization: Bearer <token>
```

#### Create Product
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Корейский Опалубка",
  "count": 10,
  "size": "2x50",
  "price": 5000
}
```

#### Update Product
```http
PATCH /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 15,
  "price": 6000
}
```

#### Delete Product
```http
DELETE /products/:id
Authorization: Bearer <token>
```

### Clients (Authentication required)

#### Get All Clients
```http
GET /clients
Authorization: Bearer <token>
```

#### Get Client by ID
```http
GET /clients/:id
Authorization: Bearer <token>
```

#### Create Client
```http
POST /clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Али",
  "lastName": "Алиев",
  "phone": "+998901234567"
}
```

#### Update Client
```http
PATCH /clients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+998901234568"
}
```

#### Delete Client
```http
DELETE /clients/:id
Authorization: Bearer <token>
```

## Database Schema

### User
- `id`: Primary key
- `firstName`: Ism
- `lastName`: Familiya
- `login`: Login (unique)
- `password`: Parol (hashed)
- `createdAt`: Yaratilgan vaqti
- `updatedAt`: Yangilangan vaqti

### Product
- `id`: Primary key
- `name`: Mahsulot nomi
- `count`: Soni
- `size`: O'lchami (string)
- `price`: Narxi
- `createdAt`: Yaratilgan vaqti
- `updatedAt`: Yangilangan vaqti

### Client
- `id`: Primary key
- `firstName`: Ism
- `lastName`: Familiya
- `phone`: Telefon raqami
- `createdAt`: Yaratilgan vaqti
- `updatedAt`: Yangilangan vaqti

## Environment Variables

`.env` faylida quyidagi o'zgaruvchilarni o'rnating:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Technologies Used

- **NestJS**: Backend framework
- **Prisma**: ORM
- **SQLite**: Database
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **class-validator**: Validation
- **Passport**: Authentication strategy
# OPPBackend
