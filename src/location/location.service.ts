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

	// async decreaseNumberOfAvaliable(
	// 	location: LocationDocument,
	// 	personAmount: number,
	// 	dateTime: Date,
	// 	neededVaccine: Record<string, number>
	// ) {
	// 	const dateTimeIndex = location.dateTime.findIndex(el => el.startDateTime === dateTime)
	// 	location.dateTime[dateTimeIndex].avaliable -= personAmount

	// 	for (const vaccine in neededVaccine) {
	// 		const vaccineIndex = location.vaccines.findIndex(el => {
	// 			const currentVaccine: any = el
	// 			// console.log(el)
	// 			// console.log(currentVaccine._doc)
	// 			// console.log(
	// 			// 	currentVaccine._doc.vaccine._doc._id,
	// 			// 	vaccine,
	// 			// 	currentVaccine._doc.vaccine._doc._id == vaccine
	// 			// )
	// 			return currentVaccine._doc.vaccine._doc._id == vaccine
	// 		})

	// 		const vaccineDocument = await this.vaccineModel.findOne().lean().exec()
	// 		// console.log(vaccineIndex)
	// 		// const temp: any = location.vaccines[vaccineIndex]
	// 		// console.log(Object.keys(location.vaccines[vaccineIndex]))
	// 		// console.log(temp._doc.avaliable, typeof temp._doc.avaliable)
	// 		// location.vaccines[vaccineIndex].avaliable = temp._doc.avaliable - neededVaccine[vaccine]
	// 		// console.log(location)

	// 		this.locationModel.updateOne({ _id: location._id, vaccines: { vaccine: vaccineDocument } })
	// 	}
	// 	return location.save()
	// }

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
