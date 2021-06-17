import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class NewSymptomAssessmentFormDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	headache: boolean

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	nausea: boolean

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	fatigue: boolean

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	chills: boolean

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	musclePain: boolean

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	tiredness: boolean

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	others: string
}
