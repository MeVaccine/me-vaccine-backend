import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { ObjectID } from 'mongodb'
import { Document } from 'mongoose'
import { VaccineLocation } from './VaccineLocation.schema'

export type LocationDocument = Location & Document

@Schema()
export class Location {
	@Prop({ type: ObjectID })
	@ApiProperty()
	_id: ObjectID

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
	vaccines: VaccineLocation[]

	@Prop()
	@ApiProperty()
	dateTime: DateTime[]
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
