import { ApiProperty } from '@nestjs/swagger'

export class PreferedLocationDto {
	@ApiProperty()
	_id: string
	@ApiProperty()
	name_th: string
	@ApiProperty()
	name_en: string
	@ApiProperty()
	priority: number
	@ApiProperty()
	province_th: string
	@ApiProperty()
	province_en: string
}
