import { ApiProperty } from '@nestjs/swagger'

export class PersonListDto {
	@ApiProperty()
	_id: string
	@ApiProperty()
	prefix_en: string
	@ApiProperty()
	firstname_en: string
	@ApiProperty()
	lastname_en: string
	@ApiProperty()
	gender_en: string
	@ApiProperty()
	prefix_th: string
	@ApiProperty()
	firstname_th: string
	@ApiProperty()
	lastname_th: string
	@ApiProperty()
	gender_th: string
}
