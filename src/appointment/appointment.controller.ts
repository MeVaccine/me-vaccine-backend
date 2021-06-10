import { BadRequestException, Body, Controller, Post, Put, UseGuards } from '@nestjs/common'
import { LeanDocument } from 'mongoose'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { LocationService } from 'src/location/location.service'
import { UserDocument } from 'src/schema/User.schema'
import { VaccineDocument } from 'src/schema/Vaccine.schema'
import { VaccineService } from 'src/vaccine/vaccine.service'
import { AppointmentService } from './appointment.service'
import { NewAppointmentDto } from './dto/new-appointment.dto'

@Controller('appointment')
export class AppointmentController {
	constructor(
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
		await this.vaccineService.checkVaccinePersonValidity(data.person)

		// Verify the location existant and avaliability
		const location = await this.locationService.findById(data.locationId)
		if (!location) throw new BadRequestException('Location and/or dateTime and/or vaccube is not found')
		await this.locationService.isValidForAppointment(data, neededVaccine)

		// Create an appointment for each user
		// await this.appointmentService.newAppointment(user, location, data.dateTime, vaccine, 1)
		// const updatedUser = await this.appointmentService.getAllAppointment(user._id)
		// return updatedUser.appointments
	}

	@Put('vaccine')
	@UseGuards(JwtAuthGuard)
	async getVaccinableVaccine(@Body() ids: string[]) {
		const ops = ids.map(id => this.vaccineService.getVaccinableVaccine(id))
		return Promise.all(ops)
	}
}
