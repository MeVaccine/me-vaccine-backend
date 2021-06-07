import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Location } from './Location.schema'

export enum GenderEN {
	MALE = 'Male',
	Female = 'Female',
}

export enum GenderTH {
	MALE = 'ชาย',
	Female = 'หญิง',
}

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

	@Prop({ enum: ['ชาย', 'หญิง'] })
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

	@Prop({ enum: ['Male', 'Female'] })
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

	@Prop()
	@ApiProperty()
	preferedLocation: Location
}
