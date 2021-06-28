import { Body, Controller, Post } from '@nestjs/common'
import { AppointmentService } from 'src/appointment/appointment.service'
import { LocationService } from 'src/location/location.service'
import { VaccinateUserDto } from './dto/vaccinate-user.dto'
import { UserService } from 'src/user/user.service'
import * as dayjs from 'dayjs'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppointmentQueryResponse } from 'src/appointment/dto/appointment-query-res.dto'
import { NewAppointmentExceptionDto } from 'src/appointment/dto/new-appointment-exception.dto'
import { AppointmentStatus } from 'src/schema/Appointment.schema'

// import * as utc from 'dayjs/plugin/utc'

@ApiTags('External')
@Controller('external')
export class ExternalController {
	constructor(
		private appointmentService: AppointmentService,
		private locationService: LocationService,
		private userSerivce: UserService
	) {}

	@Post('vaccinated')
	@ApiOperation({ summary: 'For vaccinate staff at site' })
	@ApiCreatedResponse({ type: AppointmentQueryResponse })
	@ApiCreatedResponse()
	@ApiBadRequestResponse({ type: NewAppointmentExceptionDto })
	async vaccinateUser(@Body() { userId, dateTime }: VaccinateUserDto) {
		const appointment = await this.appointmentService.getLatestAppointedAppointment(userId, dateTime)
		const user = await this.userSerivce.findByID(userId)

		await this.appointmentService.updateAppointmentStatus(
			userId,
			dayjs(appointment.dateTime).toDate(),
			AppointmentStatus.VACCINATED
		)

		if (appointment.doseNumber === 2) {
			return
		}

		const nextDoseDateTime = dayjs(appointment.dateTime).add(3, 'week')
		await this.locationService.isValidForVaccinateAppointment(
			appointment.location.name_en,
			appointment.vaccine.name,
			nextDoseDateTime.format()
		)
		const location = await this.locationService.findByEnName(appointment.location.name_en)
		const neededVaccines = {}
		neededVaccines[appointment.vaccine.name] = 1

		const [newAppointment] = await Promise.all([
			this.appointmentService.newAppointment(
				user,
				appointment.location,
				nextDoseDateTime.toDate(),
				appointment.vaccine,
				appointment.doseNumber + 1
			),
			this.locationService.decreaseNumberOfAvaliable(location, 1, nextDoseDateTime.toDate(), neededVaccines),
		])

		return {
			...newAppointment,
			dateTime: dayjs(newAppointment.dateTime).format(),
		}
	}
}
