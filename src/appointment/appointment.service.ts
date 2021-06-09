import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from 'src/schema/User.schema'
import { Appointment, AppointmentStatus } from 'src/schema/Appointment.schema'
import { LocationDocument } from 'src/schema/Location.schema'

@Injectable()
export class AppointmentService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	async newAppointment(
		user: UserDocument,
		locationId: LocationDocument,
		dateTime: Date,
		vaccine: string,
		doseNumber: number
	) {
		const appointment = new Appointment()
		appointment.dateTime = dateTime
		appointment.doseNumber = doseNumber
		appointment.location = locationId
		appointment.status = AppointmentStatus.APPOINTED
		appointment.vaccine = vaccine
		user.appointments.push(appointment)
		return user.save()
	}

	async getAllAppointment(userId: string) {
		return this.userModel
			.findOne({ _id: userId }, 'appointments')
			.populate('appointments.location', ['_id', 'name_th', 'name_en', 'priority', 'province_th', 'province_en'])
			.exec()
	}
}
