import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NewAppointmentExceptionDto } from 'src/appointment/dto/new-appointment-exception.dto'
import { NewAppointmentDto } from 'src/appointment/dto/new-appointment.dto'
import { Location, LocationDocument } from 'src/schema/Location.schema'

@Injectable()
export class LocationService {
	constructor(@InjectModel(Location.name) private locationModel: Model<LocationDocument>) {}

	findById(locationId: string) {
		return this.locationModel.findOne({ _id: locationId }).exec()
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
					'Your selected date and time is full',
					'ขออภัย วันและเวลาที่คุณเลือกเต็มแล้ว'
				)
			)

		// Count number of vaccine and check if enough

		return true
	}
}
