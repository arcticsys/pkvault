"use client";

import { useState, useEffect } from "react";
import Failed from "./components/error";
import Loading from "./components/loading";
//import { isFailedContent, ApiDataOverviewResponse, sendrequest } from "./lib";
import { sendrequest } from "./lib";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    //const [isFailed, setIsFailed] = useState<isFailedContent>({ status: false });
    const [isFailed, setIsFailed] = useState({ status: false, message: "" });
    //const [Content, setContent] = useState<ApiDataOverviewResponse>({ count: 0 });
    const [Content, setContent] = useState({ count: 0 });

    useEffect(() => {
        sendrequest('/api/data/overview', 'GET', null)
            .then((response) => {
                setIsLoading(false);
                if (response && "count" in response && typeof response.count === "number") {
                    setContent(response);
                } else {
                    setIsFailed({ status: true, message: "Invalid data format" });
                }
            })
            .catch(error => {
                setIsFailed({ status: true, message: error.message });
                setIsLoading(false);
            });
    }, []);

    if (isFailed.status) {
        return (
            <Failed page="home" error={isFailed.message || "Unspecified error"} />
        );
    }

    if (isLoading) {
        return (
            <Loading page="home" />
        );
    }

    return (
        <div>
            <h1 className="text-3xl">Welcome to PKVault</h1>
            <p className="mt-4">Select an option from the sidebar to get started.</p>
            <p className="mt-4">Total Pokémon: {Content.count}</p>
        </div>
    );
}