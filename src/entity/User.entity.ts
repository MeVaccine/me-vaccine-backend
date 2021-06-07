import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm'

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
	nationalID: string
	@Column()
	prefix_th: string
	@Column()
	firstname_th: string
	@Column()
	lastname_th: string
	@Column({ type: 'enum', enum: GenderTH })
	gender_th: GenderTH
	@Column()
	prefix_en: string
	@Column()
	firstname_en: string
	@Column()
	lastname_en: string
	@Column({ type: 'enum', enum: GenderEN })
	gender_en: GenderEN
	@Column()
	dateOfBirth: Date
}
