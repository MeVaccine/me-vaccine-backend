import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NationalIDQueryDto } from 'src/api/dto/national-id-query.dto'
import { Location, LocationDocument } from 'src/schema/Location.schema'
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

	findByID(userId: string) {
		return this.userModel.findOne({ _id: userId }).exec()
	}

	findByNationalID(nationalID: string) {
		return this.userModel.findOne({ nationalID }).exec()
	}

	findByNationalIDAndVerified(nationalID: string) {
		return this.userModel.findOne({ nationalID, isPhoneVerify: true }).exec()
	}

	findByNationalIdAndPhone(nationalID: string, phoneNumber: string) {
		return this.userModel.findOne({ nationalID, phoneNumber, isPhoneVerify: true }).exec()
	}

	updateIsPhoneVerifyToTrue(userId: string) {
		return this.userModel.updateOne({ _id: userId }, { isPhoneVerify: true }).exec()
	}

	changePreferedLocation(userId: string, newLocation: LocationDocument) {
		return this.userModel.updateOne({ _id: userId }, { preferedLocation: newLocation }).exec()
	}

	async getPreferedLocation(userId: string) {
		const user = await this.userModel.findById(userId, 'preferedLocation').populate('preferedLocation').exec()
		return user.preferedLocation
	}

	async getPreferedLocationWithoutDatetime(userId: string) {
		const user = await this.userModel
			.findById(userId, 'preferedLocation')
			.populate('preferedLocation', ['_id', 'name_th', 'name_en', 'priority', 'province_th', 'province_en'])
			.exec()
		return user.preferedLocation
	}

	async changePhoneNumber(userId: string, newPhoneNumber: string) {
		return this.userModel.findByIdAndUpdate(userId, { phoneNumber: newPhoneNumber })
	}
}
