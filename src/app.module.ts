import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'

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
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
