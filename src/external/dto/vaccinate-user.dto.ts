import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsMongoId } from 'class-validator'

export class VaccinateUserDto {
	@ApiProperty()
	@IsMongoId()
	userId: string

	@ApiProperty()
	@IsDateString()
	dateTime: Date
}
