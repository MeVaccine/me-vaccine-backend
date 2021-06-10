import { BadRequestException, Body, Controller, Post, Put, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { LocationService } from 'src/location/location.service'
import { Appointment } from 'src/schema/Appointment.schema'
import { UserDocument } from 'src/schema/User.schema'
import { UserService } from 'src/user/user.service'
import { VaccineService } from 'src/vaccine/vaccine.service'
import { AppointmentService } from './appointment.service'
import { NewAppointmentExceptionDto } from './dto/new-appointment-exception.dto'
import { NewAppointmentDto } from './dto/new-appointment.dto'

@Controller('appointment')
export class AppointmentController {
	constructor(
		private userService: UserService,
		private appointmentService: AppointmentService,
		private locationService: LocationService,
		private vaccineService: VaccineService
	) {}

	@Post('new')
	@UseGuards(JwtAuthGuard)
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

		// Create an appointment for each user
		const createAppointmentsOps: Promise<Appointment>[] = users.map((el, index) =>
			this.appointmentService.newAppointment(el, location, data.dateTime, vaccines[index], 1)
		)
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
	@ApiOperation({ description: 'Get the vaccinable vaccine for each person' })
	@ApiOkResponse()
	async getVaccinableVaccine(@Body() ids: string[]) {
		const ops = ids.map(id => this.vaccineService.getVaccinableVaccine(id))
		return Promise.all(ops)
	}
}
