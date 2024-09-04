import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PhoneCall from "./PhoneCall"
import PhoneCallPhoneNumber from "./PhoneCallPhoneNumber"

export function PhoneTabs() {
  return (
    <Tabs defaultValue="assistant" className="w-full h-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="assistant">AI Assistant Call</TabsTrigger>
        <TabsTrigger value="phonenumber">Phone Number Call</TabsTrigger>
      </TabsList>
      <TabsContent value="assistant" className="h-[calc(100%-48px)] overflow-y-auto">
        <PhoneCall />
      </TabsContent>
      <TabsContent value="phonenumber" className="h-[calc(100%-48px)] overflow-y-auto">
        <PhoneCallPhoneNumber />
      </TabsContent>
    </Tabs>
  )
}