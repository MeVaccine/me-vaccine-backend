import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiService } from 'src/api/api.service'
import { OTPService } from 'src/api/otp.service'
import { User } from 'src/entity/User.entity'
import { LocationService } from 'src/location/location.service'
import { RegisNewUserDto } from './dto/regis-new-user.dto'
import { UserService } from './user.service'

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
	@ApiResponse({ status: 201, description: 'The User information', type: User })
	@ApiResponse({ status: 400 })
	@ApiResponse({ status: 404, description: 'LaserID and/or natioalID is/are in wrong format' })
	async registerNewUser(@Body() regisNewUserDto: RegisNewUserDto) {
		const personData = await this.apiService.searchByNationalID(regisNewUserDto.nationalID, regisNewUserDto.laserID)
		const existingUser = await this.userService.findByNationalID(regisNewUserDto.nationalID)
		if (existingUser && existingUser.isPhoneVerify) throw new BadRequestException('User already register')

		const preferedLocation = await this.locationService.findById(regisNewUserDto.preferedLocation)
		if (!preferedLocation) throw new NotFoundException('Prefered location is not found')

		let newUser: User
		if (!existingUser) {
			newUser = await this.userService.createUser(personData, regisNewUserDto.phoneNumber, preferedLocation)
		} else {
			await this.userService.updatePhoneNumberAndLocation(
				existingUser.id,
				regisNewUserDto.phoneNumber,
				preferedLocation
			)
			await this.otpService.generatedAndSentOTP(existingUser.id.toString(), regisNewUserDto.phoneNumber)
		}
		// await this.otpService.generatedAndSentOTP(
		// 	existingUser ? existingUser.id.toString() : newUser.id.toString(),
		// 	regisNewUserDto.phoneNumber
		// )
	}
}
