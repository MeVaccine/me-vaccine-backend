import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
	getTimestamp(): Date {
		return new Date()
	}
}
