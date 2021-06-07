import {
	BadRequestException,
	HttpService,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NationalIDQueryDto } from './dto/national-id-query.dto'

@Injectable()
export class ApiService {
	constructor(private configService: ConfigService, private httpService: HttpService) {}

	async searchByNationalID(nationalID: string, laserID: string): Promise<NationalIDQueryDto> {
		try {
			const baseUrl = this.configService.get<string>('NATIONAL_EXTERNAL_API_URL')
			const res = await this.httpService
				.get(`${baseUrl}/nationid`, {
					params: { id: nationalID, laserID },
				})
				.toPromise()
			return res.data
		} catch (error) {
			const errorStatus = error.response.status
			if (errorStatus === 400) {
				throw new BadRequestException()
			} else if (errorStatus === 404) {
				throw new NotFoundException()
			}
			throw new InternalServerErrorException()
		}
	}

	async sendOTP(phoneNumber: string, otpCode: string, refCode: string) {
		const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID')
		const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN')
		const fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER')
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const client = require('twilio')(accountSid, authToken)

		const message = `รหัส OTP ของคุณคือ ${otpCode} รหัสอ้างอิง ${refCode} ห้ามบอกรหัสนี้แก่ผู้อื่น\nYour OTP code is ${otpCode}, Ref ${refCode} Please do not share this code to others`

		return client.messages.create({
			body: message,
			from: fromNumber,
			to: `+66${phoneNumber}`,
		})
	}
}
