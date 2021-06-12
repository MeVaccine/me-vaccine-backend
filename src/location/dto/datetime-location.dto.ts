import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

export class DateTimeLocationQueryDto {
	@ApiProperty()
	@IsDateString()
	date: string
}
