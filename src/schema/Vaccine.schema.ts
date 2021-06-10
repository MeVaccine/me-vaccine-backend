import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { ObjectID } from 'mongodb'

export type VaccineDocument = Vaccine & Document

@Schema()
export class Vaccine {
	@Prop({ type: ObjectID })
	@ApiProperty()
	_id: ObjectID

	@Prop()
	@ApiProperty()
	name: string

	@Prop()
	@ApiProperty()
	minAge: number

	@Prop({ required: false })
	@ApiProperty()
	maxAge: number
}

export const VaccineSchema = SchemaFactory.createForClass(Vaccine)
