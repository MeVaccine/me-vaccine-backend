import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectID } from 'mongodb'
import { Model, ObjectId } from 'mongoose'
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
		const user = await this.userModel
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
		return user.persons
	}

	async countPerson(userId: ObjectId): Promise<number> {
		const persons = await this.userModel
			.aggregate([{ $match: { _id: userId } }, { $project: { count: { $size: '$persons' } } }])
			.exec()
		console.log(persons)
		return persons[0].count
	}

	async isExceededPersonLimit(userId: ObjectId): Promise<boolean> {
		const count = await this.countPerson(userId)
		return count === 5
	}

	async deletePerson(userId: string, personId: string) {
		return this.userModel.updateOne({ _id: userId }, { $pull: { persons: personId } })
	}

	async isPersonOfUser(userId: string, persons: UserDocument[]): Promise<boolean> {
		const userIndex = persons.findIndex(el => el._id === userId)
		if (userIndex !== -1) persons.splice(userIndex, 1)
		const person = await this.userModel.findOne({ _id: userId, persons: { $in: persons } })
		return person ? true : false
	}
}
