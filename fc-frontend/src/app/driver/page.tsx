"use client";

import { useRef } from "react";
import { useMap } from "../hooks/useMap";

export function DriverPage() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);

    return (
        <>
            top
        </>
    );
}

export default DriverPage;
