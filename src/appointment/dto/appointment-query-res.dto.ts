import { ApiProperty } from '@nestjs/swagger'
import { AppointmentStatus } from 'src/schema/Appointment.schema'

export class AppointmentQueryLocation {
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

export class AppointmentQueryVaccine {
	@ApiProperty()
	_id: string
	@ApiProperty()
	name: string
	@ApiProperty()
	minAge: number
	@ApiProperty()
	maxAge: number
}

export class AppointmentQueryResponse {
	@ApiProperty({ enum: AppointmentStatus })
	status: AppointmentStatus
	@ApiProperty()
	_id: string
	@ApiProperty()
	dateTime: Date
	@ApiProperty()
	doseNumber: number
	@ApiProperty({ type: AppointmentQueryLocation })
	location: AppointmentQueryLocation
	@ApiProperty({ type: AppointmentQueryVaccine })
	vaccine: AppointmentQueryVaccine
}
