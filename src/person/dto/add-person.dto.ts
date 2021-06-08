import { ApiProperty } from '@nestjs/swagger'
import { Length } from 'class-validator'

export class AddPersonDto {
	@ApiProperty()
	@Length(13, 13)
	nationalID: string
	@ApiProperty()
	@Length(12, 12)
	laserID: string
}
