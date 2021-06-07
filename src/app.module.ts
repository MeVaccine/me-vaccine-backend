import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { ApiModule } from './api/api.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		TypeOrmModule.forRoot({
			type: 'mongodb',
			url: process.env.MONGODB_CONNECTION_URL,
			entities: ['dist/**/*.entity{.ts,.js}'],
			synchronize: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}),
		UserModule,
		ApiModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
