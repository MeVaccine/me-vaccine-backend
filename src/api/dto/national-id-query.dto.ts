import { ApiProperty } from '@nestjs/swagger'

export interface NationalIDQueryDto {
	id: string
	laserID: string
	en: UserData
	th: UserData
}

export class NationalInfoData {
	@ApiProperty()
	prefix: string
	@ApiProperty()
	firstname: string
	@ApiProperty()
	lastname: string
	@ApiProperty()
	date_of_birth: Date
	@ApiProperty()
	gender: string
	@ApiProperty()
	province: string
}

export class NationalInfoQueryDto {
	@ApiProperty()
	id: string
	@ApiProperty()
	laserID: string
	@ApiProperty()
	en: NationalInfoData
	@ApiProperty()
	th: NationalInfoData
}

export interface UserData {
	prefix: string
	firstname: string
	lastname: string
	date_of_birth: Date
	gender: string
	province: string
}
