"use client";
import React, { useState } from "react";
import {
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  type JSONContent,
  EditorCommandList,
  EditorBubble,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { defaultExtensions } from "./extensions";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { ColorSelector } from "./selectors/color-selector";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { handleImageDrop, handleImagePaste } from "novel/plugins";
import { uploadFn } from "./image-upload";
import { Separator } from "../ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { useEffect, useRef } from "react";

const extensions = [...defaultExtensions, slashCommand];

interface EditorProp {
  initialValue?: JSONContent;
  onChange: (value: JSONContent) => void;
}

const Editor = ({ initialValue, onChange }: EditorProp) => {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openText, setOpenText] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [isNovelTitleSelected, setIsNovelTitleSelected] = useState(false);
  // const titleRef = useRef(null);
  const titleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (titleRef.current && !titleRef.current.contains(event.target as Node)) {
        setIsNovelTitleSelected(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <EditorRoot>
      <div className="flex justify-center w-full">
        <div className="w-[98%] max-w-[98%]">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle
                ref={titleRef}
                className="cursor-pointer"
                onClick={() => setIsNovelTitleSelected(!isNovelTitleSelected)}
              >
                Text Editor Novel
              </CardTitle>
              <CardDescription>
                Novel is a Notion-style WYSIWYG editor with AI-powered autocompletion. Built with Tiptap + Vercel AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <form>
                <div className="space-y-2">
                  <Label htmlFor="message">Text</Label>
                  <EditorContent
                    className=" rounded-md border min-h-[55vh] p-5"
                    {...(initialValue && { initialContent: initialValue })}
                    extensions={extensions}
                    editorProps={{
                      handleDOMEvents: {
                        keydown: (_view, event) => handleCommandNavigation(event),
                      },
                      handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
                      handleDrop: (view, event, _slice, moved) =>
                        handleImageDrop(view, event, moved, uploadFn),
                      attributes: {
                        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none`,
                      },
                    }}
                    onUpdate={({ editor }) => {
                      onChange(editor.getJSON());
                    }}
                    slotAfter={<ImageResizer />}
                  >
                    {/* {isNovelTitleSelected && ( */}
                    <>
                      <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-popover p-1 shadow-md transition-all">
                        <EditorCommandEmpty className="px-2 py-1.5 text-sm text-muted-foreground">
                          No results
                        </EditorCommandEmpty>
                        <EditorCommandList className="space-y-1">
                          {Array.isArray(suggestionItems) && suggestionItems.map((item) => (
                            <EditorCommandItem
                              value={item.title}
                              onCommand={(val) => item.command?.(val)}
                              className="flex w-full items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                              key={item.title}
                            >
                              <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-input bg-background">
                                {item.icon}
                              </div>
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </EditorCommandItem>
                          ))}
                        </EditorCommandList>
                      </EditorCommand>

                      <EditorBubble
                        tippyOptions={{ placement: "bottom" }}
                        className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border bg-popover shadow-md"
                      >
                        <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
                          <Separator orientation="vertical" />
                          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                          <Separator orientation="vertical" />

                          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
                          <Separator orientation="vertical" />
                          <Separator orientation="vertical" />
                          <TextButtons />
                          <Separator orientation="vertical" />
                          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
                        </GenerativeMenuSwitch>
                      </EditorBubble>
                    </>

                    {/* // )} */}
                  </EditorContent>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </EditorRoot>
  );
};

export default Editor;