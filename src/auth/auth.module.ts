import { Module } from '@nestjs/common'
import { UserModule } from 'src/user/user.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { LocationModule } from 'src/location/location.module'
import { ApiModule } from 'src/api/api.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './jwt.strategy'

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {
					algorithm: 'HS256',
				},
				verifyOptions: {
					algorithms: ['HS256'],
				},
			}),
		}),
		PassportModule,
		ConfigModule,
		UserModule,
		LocationModule,
		ApiModule,
	],
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
