import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsPhoneNumber, Length } from 'class-validator'

export class RegisNewUserDto {
	@ApiProperty()
	@Length(13, 13)
	nationalID: string
	@ApiProperty()
	@Length(12, 12)
	laserID: string
	@ApiProperty()
	@IsPhoneNumber('TH')
	phoneNumber: string
	@ApiProperty()
	@IsMongoId()
	preferedLocation: string
}
