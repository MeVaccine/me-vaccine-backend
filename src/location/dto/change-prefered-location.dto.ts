import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class ChangePreferedLocationDto {
	@ApiProperty()
	@IsMongoId()
	locationId: string
}
