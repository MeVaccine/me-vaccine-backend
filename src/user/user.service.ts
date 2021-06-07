import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NationalIDQueryDto } from 'src/api/dto/national-id-query.dto'
import { Location } from 'src/entity/Location.entity'
import { GenderEN, GenderTH, User } from 'src/entity/User.entity'
import { MongoRepository } from 'typeorm'

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private usersRepository: MongoRepository<User>) {}

	createUser(personData: NationalIDQueryDto, phoneNumber: string, preferedLocation: Location): Promise<User> {
		const genderEN = GenderEN.Female == personData.en.gender ? GenderEN.Female : GenderEN.MALE
		const genderTH = GenderTH.Female == personData.th.gender ? GenderTH.Female : GenderTH.MALE
		const user = this.usersRepository.create({
			nationalID: personData.id,
			dateOfBirth: personData.en.date_of_birth,
			prefix_en: personData.en.prefix,
			firstname_en: personData.en.firstname,
			lastname_en: personData.en.lastname,
			gender_en: genderEN,
			prefix_th: personData.th.prefix,
			firstname_th: personData.th.firstname,
			lastname_th: personData.th.lastname,
			gender_th: genderTH,
			phoneNumber,
			preferedLocation,
		})
		return this.usersRepository.save(user)
	}

	findByNationalID(nationalID: string): Promise<User> {
		return this.usersRepository.findOne({ where: { nationalID } })
	}
}
