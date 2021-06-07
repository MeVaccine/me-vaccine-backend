import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { ApiModule } from './api/api.module'
import { LocationModule } from './location/location.module'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		MongooseModule.forRoot(process.env.MONGODB_CONNECTION_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}),
		UserModule,
		ApiModule,
		LocationModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
