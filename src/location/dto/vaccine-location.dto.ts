import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class VaccineLocationParamDto {
	@ApiProperty()
	@IsMongoId()
	locationId: string
}
