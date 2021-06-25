import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { LeanDocument, Model } from 'mongoose'
import { User, UserDocument } from 'src/schema/User.schema'
import { Appointment, AppointmentStatus } from 'src/schema/Appointment.schema'
import { LocationDocument } from 'src/schema/Location.schema'
import { Vaccine, VaccineDocument } from 'src/schema/Vaccine.schema'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

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
			.lean()
			.exec()
		if (!user.appointments) return []
		const appointments = user.appointments.map(el => ({
			...el,
			dateTime: dayjs(el.dateTime).utcOffset(7).format(),
		}))
		return appointments
	}

	async getNextAppointment(userId: string) {
		const appointments = await this.getAllAppointment(userId)
		if (appointments.length === 0) return {}

		let nextAppointment = appointments[0]
		const now = dayjs.utc().utcOffset(7)
		let minDatediff = 200000000

		for (const appointment of appointments) {
			const dateDiff = dayjs(appointment.dateTime).diff(now, 'day')
			if (appointment.status === AppointmentStatus.APPOINTED && dateDiff <= minDatediff) {
				minDatediff = dateDiff
				nextAppointment = appointment
			}
		}
		return nextAppointment
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

	async getLatestVaccinedAppointment(userId: string): Promise<LeanDocument<Appointment>> {
		const user = await this.userModel
			.findById(userId)
			.populate('appointments.vaccine')
			.populate('appointments.location')
			.lean()
			.exec()
		if (!user.appointments || !user.appointments[0]) return null
		let latestAppointment = null
		for (const appointment of user.appointments) {
			if (appointment.status === AppointmentStatus.VACCINATED) latestAppointment = appointment
		}
		return latestAppointment
	}

	async getLatestAppointedAppointment(userId: string, dateTime: Date) {
		const user = await this.getAllAppointment(userId)
		const formatedDateTime = dayjs(dateTime)
		const appointment = user.find(
			ele => ele.status === AppointmentStatus.APPOINTED && dayjs(ele.dateTime).isSame(formatedDateTime, 'day')
		)
		if (!appointment) throw new BadRequestException('No Appointment to be vaccinated')
		return appointment
	}
}
