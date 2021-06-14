import { ApiProperty } from '@nestjs/swagger'
import { AppointmentQueryResponse } from 'src/appointment/dto/appointment-query-res.dto'

export class LandingInfoDto {
	@ApiProperty()
	firstname_th: string
	@ApiProperty()
	firstname_en: string
	@ApiProperty({ type: AppointmentQueryResponse })
	appointment: AppointmentQueryResponse
}
