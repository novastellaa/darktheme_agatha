'use client'


import Editor from "@/components/editor/advanced-editor";
import { useState } from "react";
import { JSONContent } from "novel";
import { defaultValue } from "../default-value";


export default function EditorPage() {
    const [value, setValue] = useState<JSONContent>(defaultValue);

    return (
        <Editor initialValue={value} onChange={setValue} />
    )
}