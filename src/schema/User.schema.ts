import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { ObjectID } from 'mongodb'
import { Document } from 'mongoose'
import { Location } from './Location.schema'

export enum GenderEN {
	MALE = 'Male',
	Female = 'Female',
}

export enum GenderTH {
	MALE = 'ชาย',
	Female = 'หญิง',
}

export enum AppointmentStatus {
	APPOINTED = 'Appointed',
	VACCINATED = 'Vaccinated',
	CANCELED = 'Canceled',
}

export type UserDocument = User & Document
@Schema()
export class User {
	@Prop({ length: 13, required: true })
	@ApiProperty()
	nationalID: string

	@Prop({ required: true })
	@ApiProperty()
	prefix_th: string

	@Prop({ required: true })
	@ApiProperty()
	firstname_th: string

	@Prop({ required: true })
	@ApiProperty()
	lastname_th: string

	@Prop({ enum: [GenderTH.Female, GenderTH.MALE] })
	@ApiProperty()
	gender_th: GenderTH

	@Prop({ required: true })
	@ApiProperty()
	prefix_en: string

	@Prop({ required: true })
	@ApiProperty()
	firstname_en: string

	@Prop({ required: true })
	@ApiProperty()
	lastname_en: string

	@Prop({ enum: [GenderEN.Female, GenderEN.MALE] })
	@ApiProperty()
	gender_en: GenderEN

	@Prop({ required: true })
	@ApiProperty()
	dateOfBirth: Date

	@Prop({ required: true })
	@ApiProperty()
	phoneNumber: string

	@Prop({ default: false })
	@ApiProperty()
	isPhoneVerify: boolean

	@Prop({ type: ObjectID, ref: 'Location' })
	@ApiProperty()
	preferedLocation: Location

	@Prop({ type: [{ type: ObjectID, ref: 'User' }] })
	@ApiProperty()
	persons: User[]

	@Prop()
	@ApiProperty()
	appointments: Appointment[]
}

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

export const UserSchema = SchemaFactory.createForClass(User)
