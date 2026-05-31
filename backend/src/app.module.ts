import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { Rating } from './ratings/entities/rating.entity';
import { RatingsModule } from './ratings/ratings.module';
import { Store } from './stores/entities/store.entity';
import { StoresModule } from './stores/stores.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // ConfigModule reads .env and makes values available app-wide via ConfigService
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM with synchronize:true is fine for development; disable in production
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): any => {
        const dbType = config.get<string>('DB_TYPE', 'postgres') as any;
        if (dbType === 'sqlite') {
          return {
            type: 'better-sqlite3',
            database: config.get<string>('DB_DATABASE', 'store_ratings.sqlite'),
            entities: [User, Store, Rating],
            synchronize: true,
            logging: false,
          };
        }
        return {
          type: dbType,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', dbType === 'mysql' ? 3306 : 5432),
          username: config.get<string>('DB_USERNAME', dbType === 'mysql' ? 'root' : 'postgres'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE', 'store_ratings'),
          entities: [User, Store, Rating],
          synchronize: true, // Auto-creates tables from entities
          logging: false,
        };
      },
    }),

    AuthModule,
    UsersModule,
    StoresModule,
    RatingsModule,
    DashboardModule,
  ],
  providers: [
    // Global validation pipe: strips unknown fields (whitelist) and auto-transforms types
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    },
  ],
})
export class AppModule {}
