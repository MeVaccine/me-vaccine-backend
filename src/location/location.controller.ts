import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { UserDocument } from 'src/schema/User.schema'
import { UserService } from 'src/user/user.service'

@Controller('location')
@ApiTags('Location')
export class LocationController {
	constructor(private userService: UserService) {}

	@Get('prefered')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get user current prefered location' })
	async getPreferedLocation(@User() user: UserDocument) {
		return this.userService.getPreferedLocationWithoutDatetime(user._id)
	}
}
