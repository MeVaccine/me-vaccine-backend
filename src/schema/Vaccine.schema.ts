import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

export type VaccineDocument = Vaccine & Document

@Schema()
export class Vaccine {
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
