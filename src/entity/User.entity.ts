import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm'

export enum GenderEN {
	MALE = 'Male',
	Female = 'Female',
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
	@Column()
	gender_th: string
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
