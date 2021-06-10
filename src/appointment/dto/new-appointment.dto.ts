import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsMongoId } from 'class-validator'
export class NewAppointmentPersonDto {
	@ApiProperty()
	@IsMongoId()
	id: string

	@ApiProperty()
	@IsMongoId()
	vaccineId: string
}
export class NewAppointmentDto {
	@ApiProperty()
	@IsMongoId()
	locationId: string

	@ApiProperty()
	@IsDateString()
	dateTime: Date

	@ApiProperty({ type: NewAppointmentPersonDto })
	@IsArray()
	person: NewAppointmentPersonDto[]
}
