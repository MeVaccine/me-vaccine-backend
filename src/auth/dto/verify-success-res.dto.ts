import { ApiProperty } from '@nestjs/swagger'

export class VerifySuccessResponse {
	@ApiProperty()
	token: string
}
