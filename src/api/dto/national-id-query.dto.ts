export interface NationalIDQueryDto {
	id: string
	laserID: string
	en: UserData
	th: UserData
}

export interface UserData {
	prefix: string
	firstname: string
	lastname: string
	date_of_birth: Date
	gender: string
	province: string
}
