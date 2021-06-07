import { CacheModule, HttpModule, Module } from '@nestjs/common'
import { ApiService } from './api.service'
import { OTPService } from './otp.service'

@Module({
	imports: [HttpModule, CacheModule.register()],
	providers: [ApiService, OTPService],
	exports: [ApiService, OTPService],
})
export class ApiModule {}
