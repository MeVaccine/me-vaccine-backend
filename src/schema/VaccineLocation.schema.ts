import { Prop } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'

export type VaccineLocationDocument = VaccineLocation & Document

export enum VaccineName {
	SINOVAC = 'Sinovac',
	SINOPHARM = 'Sinopharm',
	ASTRAZENECA = 'Oxford–AstraZeneca',
	PFIZER = 'Pfizer-BioNTech',
	MODERNA = 'Moderna',
}
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
