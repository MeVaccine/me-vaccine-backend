import { Schema, Prop } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

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
	@Prop()
	@ApiProperty()
	name: string

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
