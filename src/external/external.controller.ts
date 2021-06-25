import { Body, Controller, Post } from '@nestjs/common'
import { AppointmentService } from 'src/appointment/appointment.service'
import { LocationService } from 'src/location/location.service'
import { VaccinateUserDto } from './dto/vaccinate-user.dto'
import * as dayjs from 'dayjs'
// import * as utc from 'dayjs/plugin/utc'

@Controller('external')
export class ExternalController {
	constructor(private appointmentService: AppointmentService, private locationService: LocationService) {}

	@Post('vaccinated')
	async vaccinateUser(@Body() { userId, dateTime }: VaccinateUserDto) {
		const appointment = await this.appointmentService.getLatestAppointedAppointment(userId, dateTime)
		// console.log(appointment)
		// console.log(appointment.vaccine)
		console.log(appointment.vaccine.name)
		await this.locationService.isValidForVaccinateAppointment(
			appointment.location.name_en,
			appointment.vaccine.name,
			dayjs(appointment.dateTime).toDate()
		)
	}
}
