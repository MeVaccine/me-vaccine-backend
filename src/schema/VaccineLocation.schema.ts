import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'
import { Vaccine } from './Vaccine.schema'

export type VaccineLocationDocument = VaccineLocation & Document

export enum VaccineName {
	SINOVAC = 'Sinovac',
	SINOPHARM = 'Sinopharm',
	ASTRAZENECA = 'Oxford–AstraZeneca',
	PFIZER = 'Pfizer-BioNTech',
	MODERNA = 'Moderna',
}
@Schema()
export class VaccineLocation {
	@Prop({
		enum: [
			VaccineName.SINOPHARM,
			VaccineName.SINOVAC,
			VaccineName.ASTRAZENECA,
			VaccineName.PFIZER,
			VaccineName.MODERNA,
		],
	})
	@ApiProperty()
	name: VaccineName

	@Prop()
	@ApiProperty()
	amount: number

	@Prop()
	@ApiProperty()
	avaliable: number
}

export const VaccineLocationSchema = SchemaFactory.createForClass(Vaccine)
