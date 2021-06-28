import { ApiProperty } from '@nestjs/swagger'
import { AppointmentQueryResponse } from 'src/appointment/dto/appointment-query-res.dto'

export class LandingInfoDto {
	@ApiProperty()
	firstname_th: string
	@ApiProperty()
	firstname_en: string
	@ApiProperty()
	gender_en: string
	@ApiProperty()
	gender_th: string
	@ApiProperty()
	lastname_en: string
	@ApiProperty()
	lastname_th: string
	@ApiProperty()
	prefix_en: string
	@ApiProperty()
	prefix_th: string
	@ApiProperty()
	id: string
	@ApiProperty({ type: AppointmentQueryResponse })
	appointment: AppointmentQueryResponse
}
