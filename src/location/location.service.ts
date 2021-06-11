import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectID } from 'mongodb'
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
			.populate('vaccines.vaccine', ['_id', 'name', 'minAge', 'maxAge'], this.vaccineModel)
			.exec()
	}

	async decreaseNumberOfAvaliable(
		location: LocationDocument,
		personAmount: number,
		dateTime: Date,
		neededVaccine: Record<string, number>
	) {
		const dateTimeIndex = location.dateTime.findIndex(el => el.startDateTime === dateTime)
		const avaliable = (location.dateTime[dateTimeIndex].avaliable -= personAmount)
		// console.log(location.dateTime[dateTimeIndex].avaliable)

		// for (const vaccineName in neededVaccine) {
		// 	const vaccineIndex = location.vaccines.findIndex(el => el.name === vaccineName)
		// 	console.log(location.vaccines[vaccineIndex].avaliable)
		// 	location.vaccines[vaccineIndex].avaliable -= neededVaccine[vaccineName]
		// }
		return this.locationModel.updateOne(
			{
				_id: location._id,
				dateTime: { $elemMatch: { startDateTime: dateTime } },
			},
			{ $set: { 'dateTime.$.avaliable': avaliable } }
		)
	}

	async isValidForAppointment(data: NewAppointmentDto, neededVaccine: Record<string, number>) {
		const location = await this.locationModel
			.findOne(
				{
					_id: data.locationId,
					dateTime: {
						$elemMatch: { startDateTime: data.dateTime, avaliable: { $gte: data.person.length } },
					},
				},
				{ dateTime: false }
			)
			.populate('vaccines.vaccine', ['name', 'minAge', 'maxAge'], this.vaccineModel)
			.lean()
			.exec()

		if (!location)
			throw new BadRequestException(
				new NewAppointmentExceptionDto(
					`Your selected date and time is not avaliable for ${data.person.length} person`,
					'ขออภัย วันและเวลาที่คุณเลือก คิดไม่ออก'
				)
			)

		// Count number of vaccine and check if enough
		for (const vaccineName in neededVaccine) {
			const vaccineIndex = location.vaccines.findIndex(el => el.name === vaccineName)
			// No this type of vaccine at the location
			if (vaccineIndex === -1) {
				throw new BadRequestException(
					new NewAppointmentExceptionDto(
						'Your selected vaccine is unavaliable at this location',
						'วัคซีนท่านเลือกไม่มีที่สถานฉีดวัคซีนนี้'
					)
				)
			}
			// Have vaccine but all out
			if (location.vaccines[vaccineIndex].avaliable < neededVaccine[vaccineName]) {
				throw new BadRequestException(
					new NewAppointmentExceptionDto(
						'Your selected vaccine is unavaliable at this location',
						`${location.vaccines[vaccineIndex].name}หมด`
					)
				)
			}
		}
	}
}
