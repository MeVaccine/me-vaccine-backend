import { UserService } from 'src/user/user.service'
import { BadRequestException, Body, Controller, NotFoundException, Post } from '@nestjs/common'
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RegisNewUserDto } from './dto/regis-new-user.dto'
import { RegisNewUserResponseDo } from './dto/regis-new-user-res.dto'
import { ApiService } from 'src/api/api.service'
import { UserDocument } from 'src/schema/User.schema'
import { OTPService } from 'src/api/otp.service'
import { LocationService } from 'src/location/location.service'

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
	constructor(
		private userService: UserService,
		private apiService: ApiService,
		private otpService: OTPService,
		private locationService: LocationService
	) {}

	@Post('regis')
	@ApiOperation({ summary: 'Register new user' })
	@ApiResponse({ status: 201, type: RegisNewUserResponseDo })
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
		// const refCode = await this.otpService.generatedAndSentOTP(user.id, phoneNumber)
		// return { refCode }
	}
}
