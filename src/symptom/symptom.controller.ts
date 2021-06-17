import { Body, Controller, Get, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiConflictResponse, ApiTags, ApiCreatedResponse } from '@nestjs/swagger'
import { AppointmentService } from 'src/appointment/appointment.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { PersonService } from 'src/person/person.service'
import { UserDocument } from 'src/schema/User.schema'
import { PersonFormDto } from './dto/person-form.dto'
import { SymptomService } from './symptom.service'
import { AppointmentQueryResponse } from 'src/appointment/dto/appointment-query-res.dto'
import { NewSymptomAssessmentFormDto } from './dto/new-symptom-assessment.dto'
import { Symptom } from 'src/schema/Symptom.schema'

@Controller('symptom')
@ApiTags('Symptom Form')
export class SymptomController {
	constructor(
		private symptomService: SymptomService,
		private appointmentService: AppointmentService,
		private personService: PersonService
	) {}

	@Get('eligible')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Check if user can do symptom assessrtment form' })
	@ApiOkResponse({ description: 'User can be allow to do the form', type: AppointmentQueryResponse })
	@ApiConflictResponse({ description: 'User is not allow to do the form' })
	async isUserEligible(@User() user: UserDocument, @Query() params: PersonFormDto) {
		const userId = params.userId ? params.userId : user._id
		if (userId !== user._id) {
			const isPersonOfUser = await this.personService.isPersonOfUser(user._id, userId)
			if (!isPersonOfUser) throw new UnauthorizedException('This person is not your')
		}
		const latestAppointment = await this.appointmentService.getLatestVaccinedAppointment(userId)
		return this.symptomService.isLatestAppointmentEligible(latestAppointment)
	}

	@Post('new')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Add new symptom assessrtment form' })
	@ApiCreatedResponse()
	@ApiConflictResponse({ description: 'User is not allow to do the form' })
	async createNewAssertmentForm(
		@User() user: UserDocument,
		@Query() params: PersonFormDto,
		@Body() symptomBody: NewSymptomAssessmentFormDto
	) {
		const userId = params.userId ? params.userId : user._id
		if (userId !== user._id) {
			const isPersonOfUser = await this.personService.isPersonOfUser(user._id, userId)
			if (!isPersonOfUser) throw new UnauthorizedException('This person is not your')
		}
		const latestAppointment = await this.appointmentService.getLatestVaccinedAppointment(userId)
		// Check if eligible for create new symptom assessrtment form
		this.symptomService.isLatestAppointmentEligible(latestAppointment)
		return this.symptomService.createNewSymptomForm(userId, symptomBody)
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get symptom assessrtment history' })
	@ApiOkResponse({ type: Symptom, isArray: true })
	@ApiConflictResponse({ description: 'User is not allow to do the form' })
	async getSymptomAssessmentHistory(@User() user: UserDocument, @Query() params: PersonFormDto) {
		const userId = params.userId ? params.userId : user._id
		if (userId !== user._id) {
			const isPersonOfUser = await this.personService.isPersonOfUser(user._id, userId)
			if (!isPersonOfUser) throw new UnauthorizedException('This person is not your')
		}
		return this.symptomService.getSymptomAssessmentHistory(userId)
	}
}
