import { ApiProperty } from '@nestjs/swagger'

export class NewAppointmentExceptionDto {
	@ApiProperty()
	message_en: string

	@ApiProperty()
	message_th: string

	constructor(en: string, th: string) {
		this.message_en = en
		this.message_th = th
	}
}
