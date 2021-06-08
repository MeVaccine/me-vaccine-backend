import { ApiProperty } from '@nestjs/swagger'

export class RefCodeResponse {
	@ApiProperty()
	refCode: string
}
