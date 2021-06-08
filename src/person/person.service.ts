import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from 'src/schema/User.schema'
import { UserService } from 'src/user/user.service'

@Injectable()
export class PersonService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private userService: UserService) {}

	async addPerson(user: UserDocument, personId: string) {
		const person = await this.userService.findByID(personId)
		user.persons.push(person)
		return user.save()
	}

	async findAllPerson(userId: string) {
		return this.userModel
			.findById(userId, 'persons')
			.populate('persons', [
				'_id',
				'prefix_en',
				'firstname_en',
				'lastname_en',
				'gender_en',
				'prefix_th',
				'firstname_th',
				'lastname_th',
				'gender_th',
			])
			.exec()
	}
}
