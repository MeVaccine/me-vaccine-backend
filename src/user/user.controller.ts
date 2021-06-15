import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ApiService } from 'src/api/api.service'
import { UserService } from './user.service'
import { NationalInfoQueryDto } from '../api/dto/national-id-query.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { UserDocument } from 'src/schema/User.schema'
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto'
import { OTPService } from 'src/api/otp.service'
import { RefCodeResponse } from 'src/auth/dto/refcode-res.dto'

@Controller('user')
@ApiTags('User')
export class UserController {
	constructor(private userService: UserService, private apiService: ApiService, private otpService: OTPService) {}

	@Get('nationalInfo')
	@ApiOperation({ summary: 'Get user info from external national API' })
	@ApiOkResponse({ type: NationalInfoQueryDto, description: 'Natinal information to show the user' })
	@ApiResponse({ status: 400, description: 'Not Found' })
	@ApiResponse({ status: 404, description: 'LaserID and/or natioalID is/are in wrong format' })
	async getPersonalInfo(@Query('nationalID') nationalID: string, @Query('laserID') laserID: string) {
		return this.apiService.searchByNationalID(nationalID, laserID)
	}

	@Patch('phone')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Change user phone number' })
	@ApiBearerAuth('Authorization')
	@ApiCreatedResponse({ type: RefCodeResponse })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async changePhoneNumber(@User() user: UserDocument, @Body() { phoneNumber }: ChangePhoneNumberDto) {
		const refCode = await this.otpService.generateAndSentChangePhoneNumberOTP(user._id, phoneNumber)
		return { refCode }
	}

	@Get('phone/verify')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Verify new phone number' })
	@ApiBearerAuth('Authorization')
	@ApiOkResponse()
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	@ApiBadRequestResponse({
		description: 'OTP is not correct or expired',
	})
	async verifyNewPhoneNumber(@Query('otp') otp: string) {
		const { id, phoneNumber } = await this.otpService.getIdAndPhoneNumberFromOTP(otp)
		return this.userService.changePhoneNumber(id, phoneNumber)
	}
}
