import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { ObjectID } from 'mongodb'
import { Document } from 'mongoose'
import { Location } from './Location.schema'

export type AppointmentDocument = Appointment & Document

export enum AppointmentStatus {
	APPOINTED = 'Appointed',
	VACCINATED = 'Vaccinated',
	CANCELED = 'Canceled',
}

@Schema()
export class Appointment {
	@Prop({ type: ObjectID, ref: 'Location' })
	@ApiProperty()
	location: Location

	@Prop()
	@ApiProperty()
	dateTime: Date

	@Prop()
	@ApiProperty()
	vaccine: string

	@Prop()
	@ApiProperty()
	doseNumber: number

	@Prop({
		enum: [AppointmentStatus.APPOINTED, AppointmentStatus.CANCELED, AppointmentStatus.VACCINATED],
		default: AppointmentStatus.APPOINTED,
	})
	@ApiProperty()
	status: AppointmentStatus
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment)
