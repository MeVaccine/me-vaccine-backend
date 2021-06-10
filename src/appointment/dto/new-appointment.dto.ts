import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsMongoId } from 'class-validator'

export class NewAppointmentDto {
	@ApiProperty()
	@IsMongoId()
	locationId: string

	@ApiProperty()
	@IsDateString()
	dateTime: Date

	@ApiProperty()
	@IsArray()
	person: NewAppointmentPerson[]
}

export class NewAppointmentPerson {
	@ApiProperty()
	@IsMongoId()
	id: string

	@ApiProperty()
	@IsMongoId()
	vaccineId: string
}
