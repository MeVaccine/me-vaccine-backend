import { BadRequestException, Body, Controller, Get, Post, Query, Res } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Response } from 'express'
import { ApiService } from 'src/api/api.service'
import { NationalInfoQueryDto } from 'src/api/dto/national-id-query.dto'
import { OTPService } from 'src/api/otp.service'
import { User } from 'src/decorators/user.decorator'
import { UserDocument } from 'src/schema/User.schema'
import { UserService } from 'src/user/user.service'
import { AddPersonRegisDto } from './dto/add-person-regis.dto'
import { AddPersonResponseDto } from './dto/add-person-res.dto'
import { AddPersonDto } from './dto/add-person.dto'
import { PersonService } from './person.service'
import { PersonListDto } from './dto/person-list.dto'

@Controller('person')
@ApiTags('Person')
export class PersonController {
	constructor(
		private apiService: ApiService,
		private userService: UserService,
		private otpService: OTPService,
		private personService: PersonService
	) {}

	@Post('add/check')
	@ApiOperation({ summary: 'First step to add a person. Check between existing user and new user to add' })
	@ApiBearerAuth('Authorization')
	@ApiOkResponse({ type: NationalInfoQueryDto })
	@ApiCreatedResponse({ type: AddPersonResponseDto })
	@ApiBadRequestResponse({ description: 'LaserID and/or natioalID is/are in wrong format' })
	@ApiNotFoundResponse({ description: 'Not found in national external API' })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async newPersonCheck(@Body() { nationalID, laserID }: AddPersonDto, @Res() res: Response) {
		// Check validity of nationalID and laserID
		const personalInfo = await this.apiService.searchByNationalID(nationalID, laserID)

		const person = await this.userService.findByNationalIDAndVerified(nationalID)
		// Existing User
		if (person) {
			const refCode = await this.otpService.generatedAndSentOTP(person._id, person.phoneNumber)
			res.status(201).send({ refCode })
		}
		// New User
		res.status(200).send(personalInfo)
	}

	@Post('add/regis')
	@ApiOperation({ summary: 'Register new user for adding person' })
	@ApiBearerAuth('Authorization')
	@ApiCreatedResponse({ type: AddPersonResponseDto })
	@ApiBadRequestResponse({ description: 'LaserID and/or natioalID is/are in wrong format' })
	@ApiNotFoundResponse({ description: 'Not found in national external API' })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async newPersonRegister(
		@User() user: UserDocument,
		@Body() { nationalID, laserID, phoneNumber }: AddPersonRegisDto
	) {
		const personalInfo = await this.apiService.searchByNationalID(nationalID, laserID)
		const person = await this.userService.createUser(personalInfo, phoneNumber, user.preferedLocation)
		const refCode = await this.otpService.generatedAndSentOTP(person._id, person.phoneNumber)
		return { refCode }
	}

	@Get('add/verify')
	@ApiOperation({ summary: 'Verify OTP of adding person' })
	@ApiBearerAuth('Authorization')
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	@ApiBadRequestResponse({
		description: 'OTP is not correct or expired',
	})
	@ApiCreatedResponse({ type: PersonListDto, isArray: true })
	async verifyPerson(@User() user: UserDocument, @Query('otp') otpCode: string) {
		const personId = await this.otpService.getIdFromOTP(otpCode)
		if (!personId) throw new BadRequestException('OTP is not correct or expired')

		await this.userService.updateIsPhoneVerifyToTrue(personId as string)

		await this.personService.addPerson(user, personId as string)
		const allPerson = await this.personService.findAllPerson(user._id)
		return allPerson.persons
	}
}
