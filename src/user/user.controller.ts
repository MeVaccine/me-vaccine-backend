import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiService } from 'src/api/api.service'
import { RegisNewUserDto } from './dto/regis-new-user.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
	constructor(private userService: UserService, private apiService: ApiService) {}

	@Get('/nationalInfo')
	async getPersonalInfo(@Query('nationalID') nationalID: string, @Query('laserID') laserID: string) {
		return this.apiService.searchByNationalID(nationalID, laserID)
	}

	@Post('regis')
	async registerNewUser(@Body() regisNewUserDto: RegisNewUserDto) {
		const personData = await this.apiService.searchByNationalID(regisNewUserDto.nationalID, regisNewUserDto.laserID)
		const existingUser = await this.userService.findByNationalID(regisNewUserDto.nationalID)
		if (existingUser) {
			throw new BadRequestException('User already register')
		}
		return this.userService.createUser(personData, regisNewUserDto.phoneNumber)
	}
}
