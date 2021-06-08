import { ApiProperty } from '@nestjs/swagger'

export class AddPersonResponseDto {
	@ApiProperty()
	refCode: string
}
