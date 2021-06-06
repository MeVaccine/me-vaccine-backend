import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/entity/User.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

	async createUser() {}
}
