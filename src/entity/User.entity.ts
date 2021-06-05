import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm'

@Entity()
export class User {
	@ObjectIdColumn()
	id: ObjectID

	@Column({ length: 13 })
	nationalID: string
	@Column()
	firstname: string
	@Column()
	lastname: string
	@Column()
	dateOfBirth: Date
}
