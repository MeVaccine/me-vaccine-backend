import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from 'src/schema/User.schema'
import { Appointment, AppointmentStatus } from 'src/schema/Appointment.schema'
import { LocationDocument } from 'src/schema/Location.schema'
import { Vaccine, VaccineDocument } from 'src/schema/Vaccine.schema'

@Injectable()
export class AppointmentService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Vaccine.name) private vaccineModel: Model<VaccineDocument>
	) {}

	async newAppointment(
		user: UserDocument,
		locationId: LocationDocument,
		dateTime: Date,
		vaccine: VaccineDocument,
		doseNumber: number
	) {
		const appointment = new Appointment()
		appointment.dateTime = dateTime
		appointment.doseNumber = doseNumber
		appointment.location = locationId
		appointment.status = AppointmentStatus.APPOINTED
		appointment.vaccine = vaccine
		user.appointments.push(appointment)
		await user.save()
		return appointment
	}

	async getAllAppointment(userId: string) {
		const user = await this.userModel
			.findOne({ _id: userId }, 'appointments')
			.populate('appointments.location', ['_id', 'name_th', 'name_en', 'priority', 'province_th', 'province_en'])
			.populate('appointments.vaccine')
			.exec()
		return user.appointments
	}

	async getVaccine(id: string) {
		return this.vaccineModel.findById(id).exec()
	}

	async getVaccineDoseNumber(userId: string, vaccineDoc: VaccineDocument) {
		const user = await this.userModel.findById(userId).populate('appointments.vaccine').lean().exec()
		let doseNumber = 0
		if (!user.appointments) return 1
		for (const appointment of user.appointments) {
			if (appointment.vaccine._id.equals(vaccineDoc._id)) {
				doseNumber = appointment.doseNumber
			}
		}
		return doseNumber + 1
	}
}
