import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model } from 'mongoose'
import { NewAppointmentPersonDto } from 'src/appointment/dto/new-appointment.dto'
import { Vaccine, VaccineDocument } from 'src/schema/Vaccine.schema'
import { UserService } from 'src/user/user.service'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import { NewAppointmentExceptionDto } from 'src/appointment/dto/new-appointment-exception.dto'
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

	async getVaccinableVaccine(userId: string, vaccineFilter?: string[]) {
		const user = await this.userService.findByID(userId)
		const now = dayjs.utc().utcOffset(7)
		const age = now.diff(dayjs(user.dateOfBirth), 'year')
		const findCondition: FilterQuery<VaccineDocument> = {
			minAge: { $lte: age },
			$or: [{ maxAge: undefined }, { maxAge: { $gte: age } }],
		}
		if (vaccineFilter) {
			findCondition.name = { $in: vaccineFilter }
		}
		return (
			this.vaccineModel
				.find(findCondition, ['_id', 'name'])
				// .lean()
				.exec()
		)
	}

	async checkVaccinePersonValidity(personAppointments: NewAppointmentPersonDto[]) {
		const ops = personAppointments.map(el => this.getVaccinableVaccine(el.id))
		const vaccinableVaccine = await Promise.all(ops)
		const neededVaccines: VaccineDocument[] = []
		for (let i = 0; i < personAppointments.length; i++) {
			const neededVaccineIndex = vaccinableVaccine[i].findIndex(
				vaccine => vaccine.name === personAppointments[i].vaccine
			)
			if (neededVaccineIndex === -1)
				throw new BadRequestException(
					new NewAppointmentExceptionDto(
						'Your selected of vaccine is not suitable for some person',
						'วัคซีนที่ท่านเลือก ไม่สามารถฉีดให้กับบุคคลของท่านได้'
					)
				)
			neededVaccines.push(vaccinableVaccine[i][neededVaccineIndex])
		}
		return neededVaccines
	}
}
