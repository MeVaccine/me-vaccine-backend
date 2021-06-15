import { ApiProperty } from '@nestjs/swagger'
import { IsPhoneNumber } from 'class-validator'

export class ChangePhoneNumberDto {
	@ApiProperty()
	@IsPhoneNumber('TH')
	phoneNumber: string
}
