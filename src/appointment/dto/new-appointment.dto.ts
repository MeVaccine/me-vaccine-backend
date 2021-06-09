import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsEnum, IsMongoId } from 'class-validator'
import { VaccineName } from 'src/schema/Location.schema'

export class NewAppointmentDto {
	@ApiProperty()
	@IsMongoId()
	locationId: string

	@ApiProperty()
	@IsDateString()
	dateTime: Date

	@ApiProperty()
	@IsArray()
	person: NewAppointmentPerson[]
}

export class NewAppointmentPerson {
	@ApiProperty()
	@IsMongoId()
	id: string

	@ApiProperty()
	@IsEnum(VaccineName)
	vaccine: VaccineName
}
