import { UserService } from 'src/user/user.service'
import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger'
import { RegisNewUserDto } from './dto/regis-new-user.dto'
import { RefCodeResponse } from './dto/refcode-res.dto'
import { ApiService } from 'src/api/api.service'
import { UserDocument } from 'src/schema/User.schema'
import { OTPService } from 'src/api/otp.service'
import { LocationService } from 'src/location/location.service'
import { RequestOTPLoginDto } from './dto/login-request-otp.dto'
import { VerifySuccessResponse } from './dto/verify-success-res.dto'
import { AuthService } from './auth.service'

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
	constructor(
		private userService: UserService,
		private apiService: ApiService,
		private otpService: OTPService,
		private locationService: LocationService,
		private authService: AuthService
	) {}

	@Post('regis')
	@ApiOperation({ summary: 'Register new user' })
	@ApiResponse({ status: 201, type: RefCodeResponse })
	@ApiBadRequestResponse({ description: 'LaserID and/or natioalID is/are in wrong format' })
	@ApiNotFoundResponse({ description: 'Not found in national external API' })
	async registerNewUser(@Body() { laserID, nationalID, phoneNumber, preferedLocation }: RegisNewUserDto) {
		const personData = await this.apiService.searchByNationalID(nationalID, laserID)
		const existingUser = await this.userService.findByNationalID(nationalID)
		if (existingUser && existingUser.isPhoneVerify) throw new BadRequestException('User already register')

		const preferedLocationDoc = await this.locationService.findById(preferedLocation)
		if (!preferedLocation) throw new NotFoundException('Prefered location is not found')

		let user: UserDocument
		if (!existingUser) {
			user = await this.userService.createUser(personData, phoneNumber, preferedLocationDoc)
		} else {
			existingUser.phoneNumber = phoneNumber
			existingUser.preferedLocation = preferedLocationDoc
			user = await existingUser.save()
		}
		const refCode = await this.otpService.generatedAndSentOTP(user.id, phoneNumber)
		return { refCode }
	}

	@Post('login')
	@ApiOperation({ summary: 'Request OTP for user loging in using national ID and phone number' })
	@ApiCreatedResponse({ type: RefCodeResponse })
	@ApiBadRequestResponse({
		description: 'National ID and/or phoneNumber is not correct or user have not register yet',
	})
	async requestOTPForLogin(@Body() { nationalID, phoneNumber }: RequestOTPLoginDto) {
		const user = await this.userService.findByNationalIdAndPhone(nationalID, phoneNumber)
		if (!user) throw new BadRequestException()

		const refCode = await this.otpService.generatedAndSentOTP(user.id, phoneNumber)
		return { refCode }
	}

	@Get('verify')
	@ApiOperation({ summary: 'Get the OTP code and return JWT token' })
	@ApiOkResponse({ type: VerifySuccessResponse })
	@ApiBadRequestResponse({
		description: 'OTP is not correct or expired',
	})
	async verifyOTPCode(@Query('otp') otpCode: string) {
		const userId = await this.otpService.getIdFromOTP(otpCode)
		if (!userId) throw new BadRequestException('OTP is not correct or expired')

		// Set isPhoneVerify to true
		await this.userService.updateIsPhoneVerifyToTrue(userId as string)

		// Generate JWT and send it back
		const token = await this.authService.generateJWT(userId as string)
		return { token }
	}
}
