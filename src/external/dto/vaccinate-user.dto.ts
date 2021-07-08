import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

export class VaccinateUserDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	@IsDateString()
	dateTime: Date
}
