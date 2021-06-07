import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query } from '@nestjs/common'
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiService } from 'src/api/api.service'
import { OTPService } from 'src/api/otp.service'
import { UserDocument } from 'src/schema/User.schema'
import { LocationService } from 'src/location/location.service'
import { RegisNewUserDto } from './dto/regis-new-user.dto'
import { UserService } from './user.service'
import { RegisNewUserResponseDo } from './dto/regis-new-user-res.dto'

@Controller('user')
@ApiTags('User')
export class UserController {
	constructor(
		private userService: UserService,
		private apiService: ApiService,
		private locationService: LocationService,
		private otpService: OTPService
	) {}

	@Get('/nationalInfo')
	@ApiOperation({ summary: 'Get user info from external national API' })
	@ApiResponse({ status: 400, description: 'Not Found' })
	@ApiResponse({ status: 404, description: 'LaserID and/or natioalID is/are in wrong format' })
	async getPersonalInfo(@Query('nationalID') nationalID: string, @Query('laserID') laserID: string) {
		return this.apiService.searchByNationalID(nationalID, laserID)
	}

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
		const refCode = await this.otpService.generatedAndSentOTP(user.id, phoneNumber)
		return { refCode }
	}
}
