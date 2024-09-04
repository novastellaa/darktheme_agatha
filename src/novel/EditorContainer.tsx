'use client';

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

export default function EditorContainer() {
  return (
    <div className="flex min-h-screen flex-col items-center sm:px-5 sm:py-10">
      <div className="w-full max-w-screen-lg rounded-lg border border-stone-200 bg-white sm:shadow-lg">
        <Editor />
      </div>
    </div>
  );
}