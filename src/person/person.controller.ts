import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	Res,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

@Controller('person')
@ApiTags('Person')
export class PersonController {
	constructor(
		private apiService: ApiService,
		private userService: UserService,
		private otpService: OTPService,
		private personService: PersonService
	) {}

	@Get('lists')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'List all of the person in this account' })
	@ApiBearerAuth('Authorization')
	@ApiOkResponse({ type: PersonListDto, isArray: true })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async listPerson(@User() user: UserDocument) {
		return this.personService.findAllPerson(user._id)
	}

	@Post('add/check')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'First step to add a person. Check between existing user and new user to add' })
	@ApiBearerAuth('Authorization')
	@ApiOkResponse({
		description:
			'The user has not register or verify yet. So, take user to information screen to add mobile phone number',
		type: NationalInfoQueryDto,
	})
	@ApiCreatedResponse({
		description: 'The user already register and verify. Sending OTP to registeed mobile phone number',
		type: AddPersonResponseDto,
	})
	@ApiBadRequestResponse({ description: 'LaserID and/or natioalID is/are in wrong format' })
	@ApiBadRequestResponse({ description: '5 Person limit is reached' })
	@ApiBadRequestResponse({ description: 'Cannot add yourself' })
	@ApiNotFoundResponse({ description: 'Not found in national external API' })
	@ApiConflictResponse({ description: 'This user is already has this person' })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async newPersonCheck(
		@User() user: UserDocument,
		@Body() { nationalID, laserID }: AddPersonDto,
		@Res() res: Response
	) {
		if (user.nationalID == nationalID) throw new BadRequestException('Cannot add yourself')
		const isExceeded = await this.personService.isExceededPersonLimit(user._id)
		if (isExceeded) throw new BadRequestException('5 Person limit is reached')
		// Check validity of nationalID and laserID
		const personalInfo = await this.apiService.searchByNationalID(nationalID, laserID)
		const person = await this.userService.findByNationalIDAndVerified(nationalID)
		// Existing User
		if (person) {
			const isAlreadyAdd = await this.personService.isPersonOfUser(user._id, person._id)
			if (isAlreadyAdd) throw new ConflictException('User already in the person')
			const refCode = await this.otpService.generatedAndSentOTP(person._id, person.phoneNumber)
			return res.status(201).send({ refCode, phoneNumber: person.phoneNumber })
		}
		// New User
		return res.status(200).send(personalInfo)
	}

	@Post('add/regis')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Register new user for adding person' })
	@ApiBearerAuth('Authorization')
	@ApiCreatedResponse({ description: 'Retun refCode of OTP send to the mobile phone', type: AddPersonResponseDto })
	@ApiBadRequestResponse({ description: 'LaserID and/or natioalID is/are in wrong format' })
	@ApiBadRequestResponse({ description: '5 Person limit is reached' })
	@ApiBadRequestResponse({ description: 'Cannot add yourself' })
	@ApiNotFoundResponse({ description: 'Not found in national external API' })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async newPersonRegister(
		@User() user: UserDocument,
		@Body() { nationalID, laserID, phoneNumber }: AddPersonRegisDto
	) {
		// Catch 5 limit and adding yourself
		if (user.nationalID == nationalID) throw new BadRequestException('Cannot add yourself')
		const isExceeded = await this.personService.isExceededPersonLimit(user._id)
		if (isExceeded) throw new BadRequestException('5 Person limit is reached')

		const personalInfo = await this.apiService.searchByNationalID(nationalID, laserID)
		let person = await this.userService.findByNationalID(nationalID)
		if (!person) {
			person = await this.userService.createUser(personalInfo, phoneNumber, user.preferedLocation)
		}
		const refCode = await this.otpService.generatedAndSentOTP(person._id, person.phoneNumber)
		return { refCode, phoneNumber: person.phoneNumber }
	}

	@Get('add/verify')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Verify OTP of adding person' })
	@ApiBearerAuth('Authorization')
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	@ApiBadRequestResponse({
		description: 'OTP is not correct or expired',
	})
	@ApiCreatedResponse({ type: PersonListDto, isArray: true, description: 'Return array of all person' })
	async verifyPerson(@User() user: UserDocument, @Query('otp') otpCode: string) {
		const personId = await this.otpService.getIdFromOTP(otpCode)
		if (!personId) throw new BadRequestException('OTP is not correct or expired')

		await this.userService.updateIsPhoneVerifyToTrue(personId as string)

		await this.personService.addPerson(user, personId as string)
		const allPerson = await this.personService.findAllPerson(user._id)
		return allPerson
	}

	@Delete('/:personId')
	@UseGuards(JwtAuthGuard)
	@ApiOkResponse({ type: PersonListDto, isArray: true, description: 'Return array of all person' })
	@ApiOperation({ summary: 'Delete an person by ID' })
	@ApiBearerAuth('Authorization')
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async deletePerson(@Param('personId') personId: string, @User() user: UserDocument) {
		await this.personService.deletePerson(user._id, personId)
		return this.personService.findAllPerson(user._id)
	}
}
