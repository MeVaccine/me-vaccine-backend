import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsMongoId, IsOptional } from 'class-validator'

export class PersonFormDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsMongoId()
	userId?: string
}
