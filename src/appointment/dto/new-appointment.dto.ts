import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsEnum, IsMongoId } from 'class-validator'
import { VaccineName } from 'src/schema/VaccineLocation.schema'
export class NewAppointmentPersonDto {
	@ApiProperty()
	@IsMongoId()
	id: string

	@ApiProperty()
	@IsEnum(VaccineName)
	vaccine: VaccineName
}
export class NewAppointmentDto {
	@ApiProperty()
	@IsMongoId()
	locationId: string

	@ApiProperty()
	@IsDateString()
	dateTime: Date

	@ApiProperty({ type: NewAppointmentPersonDto })
	@IsArray()
	person: NewAppointmentPersonDto[]
}
