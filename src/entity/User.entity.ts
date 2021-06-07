import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm'
import { Location } from './Location.entity'

export enum GenderEN {
	MALE = 'Male',
	Female = 'Female',
}

export enum GenderTH {
	MALE = 'ชาย',
	Female = 'หญิง',
}

@Entity({ name: 'users' })
export class User {
	@ObjectIdColumn()
	id: ObjectID

	@Column({ length: 13 })
	@ApiProperty()
	nationalID: string
	@Column()
	@ApiProperty()
	prefix_th: string
	@Column()
	@ApiProperty()
	firstname_th: string
	@Column()
	@ApiProperty()
	lastname_th: string
	@Column({ type: 'enum', enum: GenderTH })
	@ApiProperty()
	gender_th: GenderTH
	@Column()
	@ApiProperty()
	prefix_en: string
	@Column()
	@ApiProperty()
	firstname_en: string
	@Column()
	@ApiProperty()
	lastname_en: string
	@Column({ type: 'enum', enum: GenderEN })
	@ApiProperty()
	gender_en: GenderEN
	@Column()
	@ApiProperty()
	dateOfBirth: Date
	@Column()
	@ApiProperty()
	phoneNumber: string
	@Column({ default: false })
	@ApiProperty()
	isPhoneVerify: boolean
	@Column(type => Location)
	@ApiProperty()
	preferedLocation: Location
}
