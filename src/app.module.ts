import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { ApiModule } from './api/api.module'
import { LocationModule } from './location/location.module'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { PersonModule } from './person/person.module'
import { AppointmentModule } from './appointment/appointment.module'
import { VaccineModule } from './vaccine/vaccine.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('MONGODB_CONNECTION_URL'),
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: true,
			}),
		}),
		ThrottlerModule.forRoot({
			ttl: 5,
			limit: 20,
		}),
		UserModule,
		ApiModule,
		LocationModule,
		AuthModule,
		PersonModule,
		AppointmentModule,
		VaccineModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
