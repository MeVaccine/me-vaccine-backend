import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { LocationService } from 'src/location/location.service'
import { UserDocument } from 'src/schema/User.schema'
import { AppointmentService } from './appointment.service'
import { NewAppointmentDto } from './dto/new-appointment.dto'

@Controller('appointment')
export class AppointmentController {
	constructor(private appointmentService: AppointmentService, private locationService: LocationService) {}

	@Post('/new')
	@UseGuards(JwtAuthGuard)
	async makeNewAppointment(@User() user: UserDocument, @Body() data: NewAppointmentDto) {
		const location = await this.locationService.findById(data.locationId)
		if (!location) throw new BadRequestException('Location and/or dateTime and/or vaccube is not found')

		await this.locationService.isValidForAppointment(data)

		// await this.appointmentService.newAppointment(user, location, data.dateTime, vaccine, 1)
		// const updatedUser = await this.appointmentService.getAllAppointment(user._id)
		// return updatedUser.appointments
	}
}
