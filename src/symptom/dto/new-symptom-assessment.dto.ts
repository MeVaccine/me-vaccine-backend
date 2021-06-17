import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class NewSymptomAssessmentFormDto {
	@ApiPropertyOptional()
	@IsBoolean()
	headache: boolean

	@ApiPropertyOptional()
	@IsBoolean()
	nausea: boolean

	@ApiPropertyOptional()
	@IsBoolean()
	fatigue: boolean

	@ApiPropertyOptional()
	@IsBoolean()
	chills: boolean

	@ApiPropertyOptional()
	@IsBoolean()
	musclePain: boolean

	@ApiPropertyOptional()
	@IsBoolean()
	tiredness: boolean

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	others: string
}
