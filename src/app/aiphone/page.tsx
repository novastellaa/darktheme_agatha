import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PhoneTabs } from "./components/PhoneTabs";
import { useUser } from '@clerk/nextjs';
import { useToast } from "@/components/ui/use-toast";
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

export default function AIPhonePage() {

  return (
    <div className="p-4 pl-10 pt-10 flex items-center justify-center bg-[#181818]">
      <Card className="w-[92vw] h-[100vh] overflow-hidden shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">AI Phone Call</CardTitle>
          <CardDescription>
            Make AI-powered phone calls with vapi.ai
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <div className="w-[100%] h-[85vh] p-4 flex items-center justify-center bg-gray-100">
            <Card className="w-full h-full overflow-hidden">
              <PhoneTabs  />
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}