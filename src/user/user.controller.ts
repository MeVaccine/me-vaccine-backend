import { Body, Controller, Post } from '@nestjs/common'
import { ApiService } from 'src/api/api.service'
import { RegisNewUserDto } from './dto/regis-new-user.dto'
import { RegisUserPhoneDto } from './dto/regis-user-phone.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
	constructor(private userService: UserService, private apiService: ApiService) {}

	// @Post('regis/phone')
	// async registerUserPhone(@Body() regisUserPhoneDto: RegisUserPhoneDto) {

	// }

	@Post('regis')
	async registerNewUser(@Body() regisNewUserDto: RegisNewUserDto) {
		const personData = await this.apiService.searchByNationalID(regisNewUserDto.nationalID, regisNewUserDto.laserID)
		return this.userService.createUser(personData)
	}
}
