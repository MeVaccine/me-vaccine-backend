import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { ApiService } from 'src/api/api.service'
import { NationalInfoQueryDto } from 'src/api/dto/national-id-query.dto'
import { OTPService } from 'src/api/otp.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { UserDocument } from 'src/schema/User.schema'
import { UserService } from 'src/user/user.service'
import { AddPersonRegisDto } from './dto/add-person-regis.dto'
import { AddPersonResponseDto } from './dto/add-person-res.dto'
import { AddPersonDto } from './dto/add-person.dto'

@Controller('person')
@ApiTags('Person')
export class PersonController {
	constructor(private apiService: ApiService, private userService: UserService, private otpService: OTPService) {}

	@Post('add/check')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'First step to add a person. Check between existing user and new user to add' })
	@ApiOkResponse({ type: NationalInfoQueryDto })
	@ApiCreatedResponse({ type: AddPersonResponseDto })
	@ApiBadRequestResponse({ description: 'LaserID and/or natioalID is/are in wrong format' })
	@ApiNotFoundResponse({ description: 'Not found in national external API' })
	async newPersonCheck(@Body() { nationalID, laserID }: AddPersonDto, @Res() res: Response) {
		// Check validity of nationalID and laserID
		const personalInfo = await this.apiService.searchByNationalID(nationalID, laserID)

		const person = await this.userService.findByNationalIDAndVerified(nationalID)
		// Existing User
		if (person) {
			const refCode = await this.otpService.generatedAndSentOTP(person._id, person.phoneNumber)
			return { refCode }
		}
		// New User
		res.status(200).send(personalInfo)
	}

	@Post('add/regis')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Register new user for adding person' })
	@ApiCreatedResponse({ type: AddPersonResponseDto })
	@ApiBadRequestResponse({ description: 'LaserID and/or natioalID is/are in wrong format' })
	@ApiNotFoundResponse({ description: 'Not found in national external API' })
	async newPersonRegister(
		@User() user: UserDocument,
		@Body() { nationalID, laserID, phoneNumber }: AddPersonRegisDto
	) {
		const personalInfo = await this.apiService.searchByNationalID(nationalID, laserID)
		const person = await this.userService.createUser(personalInfo, phoneNumber, user.preferedLocation)
		const refCode = await this.otpService.generatedAndSentOTP(person._id, person.phoneNumber)
		return { refCode }
	}
}
