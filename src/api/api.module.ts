import { HttpModule, Module } from '@nestjs/common'
import { ApiService } from './api.service'

@Module({
	imports: [HttpModule],
	providers: [ApiService],
	exports: [ApiService],
})
export class ApiModule {}
