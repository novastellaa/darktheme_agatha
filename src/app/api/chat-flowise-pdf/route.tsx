import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { pdfFile ,  chunkSize , chunkOverlap , topK } = await req.json();

    let formData = new FormData();
    formData.append("files", pdfFile)
    formData.append("chunkSize", chunkSize)
    formData.append("chunkOverlap", chunkOverlap)
    formData.append("topK", topK)

    try {
        const response = await fetch(
            "https://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/ee67ef73-eef3-473f-8d99-3ba7a068a866",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return NextResponse.json({ content: result.text });
    } catch (error) {
        console.error('Error querying Flowise:', error);
        return NextResponse.json({ error: 'Failed to get response from Flowise' }, { status: 500 });
    }
}