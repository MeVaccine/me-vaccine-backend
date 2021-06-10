import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'
import { ObjectID } from 'mongodb'
import { Vaccine as VaccineClass } from 'src/schema/Vaccine.schema'

export type LocationDocument = Location & Document

export enum VaccineName {
	SINOVAC = 'Sinovac',
	SINOPHARM = 'Sinopharm',
	ASTRAZENECA = 'Oxford–AstraZeneca',
	PFIZER = 'Pfizer-BioNTech',
	MODERNA = 'Moderna',
}
@Schema()
export class Location {
	@Prop()
	@ApiProperty()
	name_th: string

	@Prop()
	@ApiProperty()
	name_en: string

	@Prop()
	@ApiProperty()
	priority: number

	@Prop()
	@ApiProperty()
	province_th: string

	@Prop()
	@ApiProperty()
	province_en: string

	@Prop()
	@ApiProperty()
	vaccines: Vaccine[]

	@Prop()
	@ApiProperty()
	dateTime: DateTime[]
}

export class Vaccine {
	@Prop({ type: ObjectID, ref: 'Vaccine' })
	@ApiProperty()
	name: VaccineClass

	@Prop()
	@ApiProperty()
	amount: number

	@Prop()
	@ApiProperty()
	avaliable: number
}

export class DateTime {
	@Prop()
	@ApiProperty()
	startDateTime: Date

	@Prop()
	@ApiProperty()
	endDateTime: Date

	@Prop()
	@ApiProperty()
	capacity: number

	@Prop()
	@ApiProperty()
	avaliable: number
}

export const LocationSchema = SchemaFactory.createForClass(Location)
