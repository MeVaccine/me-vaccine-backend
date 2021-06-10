import { BadRequestException, Body, Controller, Get, HttpCode, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { LocationService } from 'src/location/location.service'
import { PersonService } from 'src/person/person.service'
import { Appointment } from 'src/schema/Appointment.schema'
import { UserDocument } from 'src/schema/User.schema'
import { Vaccine, VaccineDocument } from 'src/schema/Vaccine.schema'
import { UserService } from 'src/user/user.service'
import { VaccineService } from 'src/vaccine/vaccine.service'
import { AppointmentService } from './appointment.service'
import { NewAppointmentExceptionDto } from './dto/new-appointment-exception.dto'
import { NewAppointmentDto } from './dto/new-appointment.dto'

@Controller('appointment')
@ApiTags('Appointment')
export class AppointmentController {
	constructor(
		private userService: UserService,
		private appointmentService: AppointmentService,
		private locationService: LocationService,
		private vaccineService: VaccineService,
		private personSerivce: PersonService
	) {}

	@Post('new')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ description: 'Create new appointment' })
	@ApiCreatedResponse()
	@ApiBadRequestResponse({ type: NewAppointmentExceptionDto })
	async makeNewAppointment(@User() user: UserDocument, @Body() data: NewAppointmentDto) {
		// Count number of vaccine needed
		const neededVaccine: Record<string, number> = {}
		data.person.forEach(el => {
			if (!neededVaccine[el.vaccineId]) {
				neededVaccine[el.vaccineId] = 1
			} else neededVaccine[el.vaccineId] += 1
		})
		// Check if all the person select the suitable vaccine
		const vaccines = await this.vaccineService.checkVaccinePersonValidity(data.person)

		// Verify the location existant and avaliability
		const location = await this.locationService.findById(data.locationId)
		if (!location)
			throw new BadRequestException(
				new NewAppointmentExceptionDto('Location and/or dateTime and/or vaccube is not found', '')
			)
		await this.locationService.isValidForAppointment(data, neededVaccine)

		// Get UserDocument of every person
		const getUsersOps: Promise<UserDocument>[] = data.person.map(person => this.userService.findByID(person.id))
		const users = await Promise.all(getUsersOps)
		if (users.some(el => el === undefined))
			throw new BadRequestException(new NewAppointmentExceptionDto('Some or every User is not found', ''))

		// TODO: Findout dose number of each user

		// TODO: Check that each person is really under user

		// Create an appointment for each user
		const createAppointmentsOps: Promise<Appointment>[] = users.map((el, index) =>
			this.appointmentService.newAppointment(el, location, data.dateTime, vaccines[index], 1)
		)

		// TODO: Decrease number of vaccine and location capacity

		const appointments = await Promise.all(createAppointmentsOps)
		return appointments.map(el => {
			const appointment = { ...el }
			appointment.location.dateTime = undefined
			appointment.location.vaccines = undefined
			return appointment
		})
	}

	@Put('vaccine')
	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	@ApiOperation({ description: 'Get the vaccinable vaccine for each person' })
	@ApiOkResponse({
		type: Vaccine,
		isArray: true,
		description: 'The actual response is array (person) of array of vaccine',
	})
	async getVaccinableVaccine(@Body() ids: string[]) {
		const ops: Promise<VaccineDocument[]>[] = ids.map(id => this.vaccineService.getVaccinableVaccine(id))
		return Promise.all(ops)
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getAppointments(@User() user: UserDocument, @Query('id') personId: string) {
		if (!personId || user._id === personId) return this.appointmentService.getAllAppointment(user._id)
		const isPersonOfUser = await this.personSerivce.isPersonOfUser(user._id, personId)
		if (!isPersonOfUser) throw new BadRequestException('Your are querying user that not your person')
		return this.appointmentService.getAllAppointment(personId)
	}
}
