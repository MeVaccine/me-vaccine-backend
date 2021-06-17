import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsMongoId, IsOptional } from 'class-validator'

export class FormEligibleDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsMongoId()
	userId?: string
}
