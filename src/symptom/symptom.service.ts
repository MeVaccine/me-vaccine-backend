import { ConflictException, Injectable } from '@nestjs/common'
import { LeanDocument } from 'mongoose'
import { Appointment } from 'src/schema/Appointment.schema'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
@Injectable()
export class SymptomService {
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
}
