import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { ObjectID } from 'mongodb'
import { Document } from 'mongoose'
import { Vaccine } from './Vaccine.schema'

export type VaccineLocationDocument = VaccineLocation & Document

@Schema()
export class VaccineLocation {
	@Prop({ type: ObjectID, ref: 'Vaccine' })
	@ApiProperty()
	vaccine: Vaccine

	@Prop()
	@ApiProperty()
	amount: number

	@Prop()
	@ApiProperty()
	avaliable: number
}

export const VaccineLocationSchema = SchemaFactory.createForClass(Vaccine)
