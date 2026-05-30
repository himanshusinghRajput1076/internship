import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Only allow requests from the React dev server in development
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // Clean URL prefix — all routes are under /api
  app.setGlobalPrefix('api');

  // Seed a default admin account if none exists yet
  const usersService = app.get(UsersService);
  await usersService.seedAdmin();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`\n🚀  API ready → http://localhost:${port}/api\n`);
}

bootstrap();
