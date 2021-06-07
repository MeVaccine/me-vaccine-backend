import { HttpService, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NationalIDQueryDto } from './dto/national-id-query.dto'

@Injectable()
export class ApiService {
	constructor(private configService: ConfigService, private httpService: HttpService) {}

	async searchByNationalID(nationalID: string, laserID: string): Promise<NationalIDQueryDto> {
		const baseUrl = this.configService.get<string>('NATIONAL_EXTERNAL_API_URL')
		const res = await this.httpService
			.get(`${baseUrl}/nationid`, {
				params: { id: nationalID, laserID },
			})
			.toPromise()
		return res.data
	}
}
