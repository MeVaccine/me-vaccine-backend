import { ApiProperty } from '@nestjs/swagger'
import { VaccineLocation } from 'src/schema/VaccineLocation.schema'

export class LocationQueryDto {
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
	@ApiProperty({ type: VaccineLocation })
	vaccines: VaccineLocation[]
}
