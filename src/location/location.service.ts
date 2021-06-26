import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NewAppointmentExceptionDto } from 'src/appointment/dto/new-appointment-exception.dto'
import { NewAppointmentDto } from 'src/appointment/dto/new-appointment.dto'
import { Location, LocationDocument } from 'src/schema/Location.schema'
import { Vaccine, VaccineDocument } from 'src/schema/Vaccine.schema'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
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

	async findByProvince(province: string) {
		return this.locationModel.find({ province_en: province }, { dateTime: false })
	}

	async getLocationVaccines(locationId: string) {
		const location = await this.locationModel
			.findById(locationId, 'vaccines')
			.populate('vaccines.vaccine', ['_id', 'name', 'minAge', 'maxAge'], this.vaccineModel)
			.lean()
			.exec()
		return location.vaccines
	}

	async getLocationDateTime(locationId: string, date: string) {
		const location = await this.locationModel.findById(locationId, 'dateTime').lean().exec()
		const dateTime = location.dateTime.filter(el => dayjs(el.startDateTime).isSame(dayjs(date), 'days'))
		return dateTime
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

		const ops: Promise<any>[] = [
			this.locationModel
				.updateOne(
					{
						_id: location._id,
						dateTime: { $elemMatch: { startDateTime: dateTime } },
					},
					{ $set: { 'dateTime.$.avaliable': avaliable } }
				)
				.exec(),
		]
		for (const vaccineName in neededVaccine) {
			const vaccineIndex = location.vaccines.findIndex(el => el.name === vaccineName)
			const vaccine: any = location.vaccines[vaccineIndex]
			const vaccineAvaliable = vaccine.avaliable - neededVaccine[vaccineName]
			ops.push(
				this.locationModel
					.updateOne(
						{ _id: location._id, vaccines: { $elemMatch: { name: vaccineName } } },
						{ $set: { 'vaccines.$.avaliable': vaccineAvaliable } }
					)
					.exec()
			)
		}
		return Promise.all(ops)
	}

	async isValidForVaccinateAppointment(locationName: string, neededVaccine: string, dateTime: string) {
		const location = await this.locationModel
			.findOne(
				{
					name_en: locationName,
					dateTime: {
						$elemMatch: { startDateTime: dateTime, avaliable: { $gte: 1 } },
					},
				},
				{ dateTime: false }
			)
			.populate('vaccines.vaccine', ['name', 'minAge', 'maxAge'], this.vaccineModel)
			.lean()
			.exec()
		const vaccineAtLocation = location.vaccines.findIndex(el => el.name === neededVaccine)
		if (vaccineAtLocation === -1) throw new BadRequestException()
		if (location.vaccines[vaccineAtLocation].avaliable < 1) throw new BadRequestException()
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
