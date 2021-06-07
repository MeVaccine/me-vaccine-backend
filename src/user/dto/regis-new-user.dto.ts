import { ApiProperty } from '@nestjs/swagger'

export class RegisNewUserDto {
	@ApiProperty()
	nationalID: string
	@ApiProperty()
	laserID: string
	@ApiProperty()
	phoneNumber: string
}
