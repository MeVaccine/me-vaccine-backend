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
	person: NewAppointmentPersonDto[]
}

export class NewAppointmentPersonDto {
	@ApiProperty()
	@IsMongoId()
	id: string

	@ApiProperty()
	@IsMongoId()
	vaccineId: string
}
