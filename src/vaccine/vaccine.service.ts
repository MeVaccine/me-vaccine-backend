import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NewAppointmentPersonDto } from 'src/appointment/dto/new-appointment.dto'
import { Vaccine, VaccineDocument } from 'src/schema/Vaccine.schema'
import { UserService } from 'src/user/user.service'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export class VaccineService {
	constructor(
		@InjectModel(Vaccine.name) private vaccineModel: Model<VaccineDocument>,
		private userService: UserService
	) {}

	async getAllVaccines() {
		return this.vaccineModel.find().lean().exec()
	}

	async getVaccinableVaccine(userId: string) {
		const user = await this.userService.findByID(userId)
		const now = dayjs.utc().utcOffset(7)
		const age = now.diff(dayjs(user.dateOfBirth), 'year')
		console.log(age)
		return this.vaccineModel
			.find({ minAge: { $lte: age }, $or: [{ maxAge: undefined }, { maxAge: { $gte: age } }] }, ['_id', 'name'])
			.lean()
			.exec()
	}

	// async checkVaccinePersonValidity(personAppointments: NewAppointmentPersonDto[]) {
	// 	const vaccines = await this.getAllVaccines()
	//     personAppointments.
	// }
}
