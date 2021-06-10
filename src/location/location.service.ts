import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NewAppointmentExceptionDto } from 'src/appointment/dto/new-appointment-exception.dto'
import { NewAppointmentDto } from 'src/appointment/dto/new-appointment.dto'
import { Location, LocationDocument } from 'src/schema/Location.schema'
import { Vaccine, VaccineDocument } from 'src/schema/Vaccine.schema'

@Injectable()
export class LocationService {
	constructor(
		@InjectModel(Location.name) private locationModel: Model<LocationDocument>,
		@InjectModel(Vaccine.name) private vaccineModel: Model<VaccineDocument>
	) {}

	findById(locationId: string) {
		return this.locationModel
			.findOne({ _id: locationId })
			.populate('vaccines.vaccine', 'name', this.vaccineModel)
			.exec()
	}

	async isValidForAppointment(data: NewAppointmentDto): Promise<boolean> {
		const location = await this.findById(data.locationId)
		// Check dateTime at this location is avaliable
		const selectedDateTime = location.dateTime.find(
			el => el.startDateTime === data.dateTime && el.avaliable >= data.person.length
		)
		if (!selectedDateTime)
			throw new BadRequestException(
				new NewAppointmentExceptionDto(
					`Your selected date and time is not avaliable for ${data.person.length} person`,
					'ขออภัย วันและเวลาที่คุณเลือก คิดไม่ออก'
				)
			)

		// Count number of vaccine and check if enough
		const neededVaccine: Record<string, number> = {}
		data.person.forEach(el => {
			if (!neededVaccine[el.vaccineId]) {
				neededVaccine[el.vaccineId] = 1
			} else neededVaccine[el.vaccineId] += 1
		})

		console.log(location.vaccines)
		// const neededVaccineCheck: Promise[] = []
		// for (const vaccine in neededVaccine) {
		// 	location.vaccines.findIndex(el => el.vaccine == vaccine)
		// }

		return true
	}
}
