import { ApiProperty } from '@nestjs/swagger'
import { IsPhoneNumber, Length } from 'class-validator'

export class RequestOTPLoginDto {
	@ApiProperty()
	@Length(13, 13)
	nationalID: string

	@ApiProperty()
	@IsPhoneNumber('TH')
	phoneNumber: string
}
