import { Body, Controller, Post } from '@nestjs/common'
import { AppointmentService } from 'src/appointment/appointment.service'
import { LocationService } from 'src/location/location.service'
import { VaccinateUserDto } from './dto/vaccinate-user.dto'
import { UserService } from 'src/user/user.service'
import { VaccineService } from 'src/vaccine/vaccine.service'
import * as dayjs from 'dayjs'

// import * as utc from 'dayjs/plugin/utc'

@Controller('external')
export class ExternalController {
	constructor(
		private appointmentService: AppointmentService,
		private locationService: LocationService,
		private userSerivce: UserService,
		private vaccineService: VaccineService
	) {}

	@Post('vaccinated')
	async vaccinateUser(@Body() { userId, dateTime }: VaccinateUserDto) {
		const appointment = await this.appointmentService.getLatestAppointedAppointment(userId, dateTime)
		const nextDoseDateTime = dayjs(appointment.dateTime).add(3, 'week')
		console.log(nextDoseDateTime.format())
		await this.locationService.isValidForVaccinateAppointment(
			appointment.location.name_en,
			appointment.vaccine.name,
			nextDoseDateTime.format()
		)

		const user = await this.userSerivce.findByID(userId)
		await this.appointmentService.newAppointment(
			user,
			appointment.location,
			nextDoseDateTime.toDate(),
			appointment.vaccine,
			appointment.doseNumber + 1
		)

		const location = await this.locationService.findByEnName(appointment.location.name_en)
		const neededVaccines = {}
		neededVaccines[appointment.vaccine.name] = 1
		return this.locationService.decreaseNumberOfAvaliable(location, 1, nextDoseDateTime.toDate(), neededVaccines)
	}
}
