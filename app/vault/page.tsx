"use client";

import { useState, useEffect } from "react";
import Failed from "../components/error";
import Loading from "../components/loading";
import { sendrequest } from "../lib";

export default function Vault() {
    const [isLoading, setIsLoading] = useState(true);
    const [isFailed, setIsFailed] = useState({ status: false, message: "" });
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        sendrequest('/api/vault', 'GET', null)
            .then(response => {
                setIsLoading(false);
                if ('data' in response && Array.isArray(response.data)) {
                    setItems(response.data);
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
            <Failed page="vault" error={isFailed.message || "Unspecified error"} />
        );
    }

    if (isLoading) {
        return (
            <Loading page="vault" />
        );
    } else if (!isLoading && !isFailed.status) {
        return (
            <div>
                <h1 className="text-3xl">Vault</h1>
                { items.length === 0 ? (
                    <>
                        <div>
                            Looks like you haven't added any Pokémon to your vault yet.
                        </div>
                        <div>
                            You can add Pokémon to your vault by using the "Upload Save(s)" button!
                        </div>
                    </>
                ) : (
                    <div
                        className="grid grid-flow-row auto-rows-[200px] grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] gap-5"
                        style={{ width: "100%", height: "100vh", overflow: "auto", rowGap: "10px" }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-center border rounded shadow hover:shadow-lg transition-shadow"
                                style={{ width: "150px", height: "200px" }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}