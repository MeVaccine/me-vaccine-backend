import { ApiProperty } from '@nestjs/swagger'
import { Length, IsPhoneNumber } from 'class-validator'

export class AddPersonRegisDto {
	@ApiProperty()
	@Length(13, 13)
	nationalID: string
	@ApiProperty()
	@Length(12, 12)
	laserID: string
	@ApiProperty()
	@IsPhoneNumber('TH')
	phoneNumber: string
}
