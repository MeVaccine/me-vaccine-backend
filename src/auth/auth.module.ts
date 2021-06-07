import { Module } from '@nestjs/common'
import { UserModule } from 'src/user/user.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { LocationModule } from 'src/location/location.module'
import { ApiModule } from 'src/api/api.module'

@Module({
	imports: [UserModule, LocationModule, ApiModule],
	providers: [AuthService],
	controllers: [AuthController],
})
export class AuthModule {}
