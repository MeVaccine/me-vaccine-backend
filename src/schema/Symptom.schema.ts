import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import { Document } from 'mongoose'
dayjs.extend(utc)

export type SymptomDocument = Symptom & Document

@Schema()
export class Symptom {
	@Prop({ default: dayjs.utc().utcOffset(7).toDate() })
	@ApiProperty()
	timestamp: Date

	@Prop({ required: false })
	@ApiProperty()
	headache: boolean

	@Prop({ required: false })
	@ApiProperty()
	nausea: boolean

	@Prop({ required: false })
	@ApiProperty()
	fatigue: boolean

	@Prop({ required: false })
	@ApiProperty()
	chills: boolean

	@Prop({ required: false })
	@ApiProperty()
	musclePain: boolean

	@Prop({ required: false })
	@ApiProperty()
	tiredness: boolean

	@Prop({ required: false })
	@ApiProperty()
	others: string
}

export const SymptomSchema = SchemaFactory.createForClass(Symptom)
