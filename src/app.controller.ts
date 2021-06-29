import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): any {
		return {
			success: true,
			timestamp: this.appService.getTimestamp(),
			version: '0.1',
		}
	}
}
