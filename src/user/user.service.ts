import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NationalIDQueryDto } from 'src/api/dto/national-id-query.dto'
import { Location } from 'src/schema/Location.schema'
import { GenderEN, GenderTH, User, UserDocument } from 'src/schema/User.schema'

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	createUser(personData: NationalIDQueryDto, phoneNumber: string, preferedLocation: Location) {
		const genderEN = GenderEN.Female == personData.en.gender ? GenderEN.Female : GenderEN.MALE
		const genderTH = GenderTH.Female == personData.th.gender ? GenderTH.Female : GenderTH.MALE
		const user = new this.userModel({
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
			isPhoneVerify: false,
		})
		return user.save()
	}

	findByNationalID(nationalID: string) {
		return this.userModel.findOne({ nationalID }).exec()
	}

	findByNationalIdAndPhone(nationalID: string, phoneNumber: string) {
		return this.userModel.findOne({ nationalID, phoneNumber, isPhoneVerify: true }).exec()
	}
}
