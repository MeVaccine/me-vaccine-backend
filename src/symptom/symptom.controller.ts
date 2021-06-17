import { Controller, Get, Query, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { AppointmentService } from 'src/appointment/appointment.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { PersonService } from 'src/person/person.service'
import { UserDocument } from 'src/schema/User.schema'
import { FormEligibleDto } from './dto/form-eligible.dto'
import { SymptomService } from './symptom.service'

@Controller('symptom')
export class SymptomController {
	constructor(
		private symptomService: SymptomService,
		private appointmentService: AppointmentService,
		private personService: PersonService
	) {}

	@Get('eligible')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Check if user can do symptom assertment form' })
	async isUserEligible(@User() user: UserDocument, @Query() params: FormEligibleDto) {
		const userId = params.userId ? params.userId : user._id
		if (userId !== user._id) {
			const isPersonOfUser = await this.personService.isPersonOfUser(user._id, userId)
			if (!isPersonOfUser) throw new UnauthorizedException('This person is not your')
		}
		// const latestAppointment = await this.appointmentService.getLatestVaccinedAppointment(userId)
	}
}
