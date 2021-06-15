import { BadRequestException, CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cache } from 'cache-manager'
import { customAlphabet } from 'nanoid'

@Injectable()
export class OTPService {
	private nanoIdOTP
	private nanoIdRef
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private configService: ConfigService) {
		this.nanoIdOTP = customAlphabet('0123456789', 6)
		this.nanoIdRef = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)
	}

	private async sendOTP(phoneNumber: string, otpCode: string, refCode: string) {
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

	async generatedAndSentOTP(id: string, phoneNumber: string): Promise<string> {
		const refCode = this.nanoIdRef()
		const otpCode = this.nanoIdOTP()

		await Promise.all([
			this.sendOTP(phoneNumber, otpCode, refCode),
			this.cacheManager.set(otpCode, id, { ttl: 300 }),
		])
		return refCode
	}

	async generateAndSentChangePhoneNumberOTP(id: string, phoneNumber: string): Promise<string> {
		const refCode = this.nanoIdRef()
		const otpCode = this.nanoIdOTP()

		const data = JSON.stringify({ id, phoneNumber })
		await Promise.all([
			this.sendOTP(phoneNumber, otpCode, refCode),
			this.cacheManager.set(otpCode, data, { ttl: 300 }),
		])
		return refCode
	}

	async getIdFromOTP(otpCode: string) {
		const id = await this.cacheManager.get(otpCode)
		await this.cacheManager.del(otpCode)
		return id
	}

	async getIdAndPhoneNumberFromOTP(otpCode: string): Promise<any> {
		const data: string = await this.cacheManager.get(otpCode)
		await this.cacheManager.del(otpCode)
		if (!data) throw new BadRequestException('OTP is not correct or expired')
		return JSON.parse(data)
	}
}
