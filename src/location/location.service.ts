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

	findByEnName(name: string) {
		return (
			this.locationModel
				.findOne({ name_en: name })
				.populate('vaccines.vaccine', ['_id', 'name', 'minAge', 'maxAge'], this.vaccineModel)
				// .lean()
				.exec()
		)
	}

	async findByProvince(province: string) {
		return this.locationModel.find({ province_en: province }, { dateTime: false })
	}

	async getLocationVaccines(locationId: string, onlyAvailable = false) {
		const location = await this.locationModel
			.findById(locationId, 'vaccines')
			.populate('vaccines.vaccine', ['_id', 'name', 'minAge', 'maxAge'], this.vaccineModel)
			.lean()
			.exec()
		return onlyAvailable ? location.vaccines.filter(el => el.avaliable > 0) : location.vaccines
	}

	async getLocationDateTime(locationId: string, date: string) {
		const location = await this.locationModel.findById(locationId, 'dateTime').lean().exec()
		const dateTime = location.dateTime.filter(el => dayjs(el.startDateTime).isSame(dayjs(date), 'days'))
		return dateTime
	}

	async getEarliestAvaliableDateTime(locationId: string) {
		const location = await this.locationModel.findById(locationId, 'dateTime').lean().exec()
		const now = dayjs.utc().utcOffset(7).hour(0)
		const earliestDateTime = location.dateTime.find(
			el => el.avaliable !== 0 && dayjs(el.startDateTime).isAfter(now)
		)
		if (!earliestDateTime) return []
		const dateTime = location.dateTime.filter(el =>
			dayjs(el.startDateTime).isSame(dayjs(earliestDateTime.startDateTime), 'days')
		)
		return dateTime
	}

	async decreaseNumberOfAvaliable(
		location: LocationDocument,
		personAmount: number,
		dateTime: Date,
		neededVaccine: Record<string, number>
	) {
		const dateTimeIndex = location.dateTime.findIndex(el => dayjs(el.startDateTime).isSame(dateTime))
		const avaliable = (location.dateTime[dateTimeIndex].avaliable -= personAmount)

		const ops: Promise<any>[] = [
			this.locationModel
				.updateOne(
					{
						_id: location._id,
						dateTime: { $elemMatch: { startDateTime: dayjs.utc(dateTime).utcOffset(7).format() } },
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
						$elemMatch: {
							startDateTime: dayjs.utc(dateTime).utcOffset(7).format(),
							avaliable: { $gte: 1 },
						},
					},
				},
				{ dateTime: false }
			)
			.populate('vaccines.vaccine', ['name', 'minAge', 'maxAge'], this.vaccineModel)
			.lean()
			.exec()
		const vaccineAtLocation = location.vaccines.findIndex(el => el.name === neededVaccine)
		if (vaccineAtLocation === -1) throw new BadRequestException('No Vaccine Found')
		if (location.vaccines[vaccineAtLocation].avaliable < 1)
			throw new BadRequestException('Vaccine is not avaliable')
	}

	async isValidForAppointment(data: NewAppointmentDto, neededVaccine: Record<string, number>) {
		const now = dayjs.utc().utcOffset(7)
		if (dayjs(data.dateTime).isBefore(now)) {
			throw new BadRequestException(
				new NewAppointmentExceptionDto(
					`Your selected date and time is in the past`,
					'ขออภัย วันและเวลาที่คุณเลือกไม่สามารถจองได้แล้ว'
				)
			)
		}
		const location = await this.locationModel
			.findOne(
				{
					_id: data.locationId,
					dateTime: {
						$elemMatch: {
							startDateTime: dayjs.utc(data.dateTime).utcOffset(7).format(),
							avaliable: { $gte: data.person.length },
						},
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
					`ขออภัย วันและเวลาที่คุณเลือกไม่สามารถจองได้สำหรับ ${data.person.length} ท่าน`
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
