"use client";

import { useMap } from "@/app/hooks/useMap";
import type {
    DirectionsResponseData,
    FindPlaceFromTextResponseData,
} from "@googlemaps/google-maps-services-js";
import { FormEvent, useRef, useState } from "react";

export default function NewRoutePage() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);
    const [directionsData, setDirectionsData] = useState<
        DirectionsResponseData & { request: any }
    >();

    const searchPlaces = async (e: FormEvent) => {
        e.preventDefault();

        const source = (document.getElementById("source") as HTMLInputElement)
            .value;
        const destination = (
            document.getElementById("destination") as HTMLInputElement
        ).value;

        const [sourceResponse, destinationResponse] = await Promise.all([
            fetch(
                `${process.env.NEXT_PUBLIC_NEST_API_URL}/places?text=${source}`
            ).then(),
            fetch(
                `${process.env.NEXT_PUBLIC_NEST_API_URL}/places?text=${destination}`
            ).then(),
        ]);

        const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] =
            await Promise.all([
                sourceResponse.json(),
                destinationResponse.json(),
            ]);

        if (sourcePlace.status !== "OK" || destinationPlace.status !== "OK") {
            alert("Erro ao pesquisar locais");
            return;
        }

        const sourcePlaceId = sourcePlace.candidates[0].place_id;
        const destinationPlaceId = destinationPlace.candidates[0].place_id;

        const directionsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_NEST_API_URL}/directions?originId=${sourcePlaceId}&destinationId=${destinationPlaceId}`
        );

        const directionsData: DirectionsResponseData & { request: any } =
            await directionsResponse.json();

        setDirectionsData(directionsData);

        map?.removeAllRoutes();

        await map?.addRouteWithIcons({
            routeId: "1",
            startMarkerOptions: {
                position: directionsData.routes[0].legs[0].start_location,
            },
            endMarkerOptions: {
                position: directionsData.routes[0].legs[0].end_location,
            },
            carMarkerOptions: {
                position: directionsData.routes[0].legs[0].start_location,
            },
        });
    };

    const createRoute = async () => {
        const start = directionsData!.routes[0].legs[0].start_address;
        const end = directionsData!.routes[0].legs[0].end_address;
        const routeName = start + "-" + end;

        const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL}/routes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: routeName,
                source_id: directionsData!.request.origin.place_id,
                destination_id: directionsData!.request.destination.place_id,
            }),
        });

        const route = await response.json();
    };

    return (
        <>
            <h1>Criar uma Nova Rota</h1>
            <div>
                <form
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                    onSubmit={(e) => searchPlaces(e)}
                >
                    <input
                        type="text"
                        placeholder="Origem"
                        id="source"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Destino"
                        id="destination"
                        required
                    />
                    <button type="submit">Pesquisar</button>
                </form>
            </div>
            {directionsData && (
                <div>
                    <p>
                        Origem: {directionsData.routes[0].legs[0].start_address}
                    </p>
                    <p>
                        Destino: {directionsData.routes[0].legs[0].end_address}
                    </p>
                    <p>
                        Duração:{" "}
                        {directionsData.routes[0].legs[0].duration.text}
                    </p>
                    <button onClick={() => createRoute()}>Criar rota</button>
                </div>
            )}
            <div
                id="map"
                ref={mapContainerRef}
                style={{ height: "100%", width: "100%" }}
            ></div>
        </>
    );
}
