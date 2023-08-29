import {
	DirectionsRequest,
	DirectionsResponseData,
	Client as MapsClient,
	TravelMode,
} from '@googlemaps/google-maps-services-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Injectable()
export class DirectionsService {
	constructor(
		private mapsClient: MapsClient,
		private configService: ConfigService,
	) {}

	async getDirections(placeOriginId: string, placeDestinationId: string) {
		const params: DirectionsRequest['params'] = {
			origin: `place_id:${placeOriginId.replace('place_id:', '')}`,
			destination: `place_id:${placeDestinationId.replace(
				'place_id:',
				'',
			)}`,
			mode: TravelMode.driving,
			key: this.configService.get<string>('MAPS_API_KEY'),
		};

		const { data } = await this.mapsClient.directions({
			params,
		});

		return {
			...data,
			request: {
				origin: {
					place_id: params.origin,
					location: {
						lat: data.routes[0].legs[0].start_location.lat,
						lng: data.routes[0].legs[0].start_location.lng,
					},
				},
				destination: {
					place_id: params.destination,
					location: {
						lat: data.routes[0].legs[0].end_location.lat,
						lng: data.routes[0].legs[0].end_location.lng,
					},
				},
				mode: params.mode,
			},
		};
	}
}
