import { ConflictException, Injectable } from '@nestjs/common'
import { LeanDocument, Model } from 'mongoose'
import { Appointment } from 'src/schema/Appointment.schema'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import { NewSymptomAssessmentFormDto } from './dto/new-symptom-assessment.dto'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from 'src/schema/User.schema'
import { Symptom } from 'src/schema/Symptom.schema'

dayjs.extend(utc)
@Injectable()
export class SymptomService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	isLatestAppointmentEligible(latestAppointment: LeanDocument<Appointment>) {
		if (!latestAppointment) throw new ConflictException()
		const now = dayjs.utc().utcOffset(7)
		const isLongerThanWeek = dayjs(latestAppointment.dateTime).diff(now, 'week') >= 1
		if (isLongerThanWeek) throw new ConflictException()
		return {
			...latestAppointment,
			dateTime: dayjs(latestAppointment.dateTime).format(),
			location: {
				...latestAppointment.location,
				dateTime: undefined,
				vaccines: undefined,
			},
		}
	}

	async isLatestAssessmentFormEligible(userId: string) {
		const history = await this.getSymptomAssessmentHistory(userId)
		if (history.length === 0) return
		const now = dayjs.utc().utcOffset(7).startOf('day')
		const historyDate = dayjs(history[history.length - 1].timestamp).startOf('day')
		console.log(historyDate.diff(now, 'day'), Math.abs(historyDate.diff(now, 'day')) >= 1)
		const isLongerThanDay = Math.abs(historyDate.diff(now, 'day')) >= 1
		if (!isLongerThanDay) {
			throw new ConflictException()
		}
	}

	async createNewSymptomForm(userId: string, formData: NewSymptomAssessmentFormDto) {
		const user = await this.userModel.findById(userId)
		const symptomForm = new Symptom()
		symptomForm.chills = formData.chills
		symptomForm.fatigue = formData.fatigue
		symptomForm.headache = formData.headache
		symptomForm.musclePain = formData.musclePain
		symptomForm.nausea = formData.nausea
		symptomForm.others = formData.others
		symptomForm.tiredness = formData.tiredness
		user.symptomForms.push(symptomForm)
		return user.save()
	}

	async getSymptomAssessmentHistory(userId: string) {
		const user = await this.userModel.findById(userId, { symptomForms: 1 }).lean().exec()

		return user.symptomForms ? user.symptomForms : []
	}
}
