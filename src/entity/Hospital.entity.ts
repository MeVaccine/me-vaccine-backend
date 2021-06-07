import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm'

@Entity({ name: 'hospitals' })
export class Hospital {
	@ObjectIdColumn()
	id: ObjectID

	@Column()
	@ApiProperty()
	name_th: string
	@Column()
	@ApiProperty()
	name_en: string
	@Column()
	@ApiProperty()
	priority: number
	@Column()
	@ApiProperty()
	province_th: string
	@Column()
	@ApiProperty()
	province_en: string

	@Column(type => Vaccine)
	@ApiProperty()
	vaccines: Vaccine[]

	@Column(type => DateTime)
	@ApiProperty()
	dateTime: DateTime[]
}

export class Vaccine {
	@Column()
	@ApiProperty()
	name: string

	@Column()
	@ApiProperty()
	amount: number

	@Column()
	@ApiProperty()
	avaliable: number
}

export class DateTime {
	@Column()
	@ApiProperty()
	startDateTime: Date
	@Column()
	@ApiProperty()
	endDateTime: Date
	@Column()
	@ApiProperty()
	capacity: number
	@Column()
	@ApiProperty()
	avaliable: number
}
