import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { ChevronLeft, ChevronRight, Copy, MoreVertical, User } from "lucide-react"

interface DashboardUserComponentProps {
  userCount: number;
  weeklyUserCount: number;
  totalUserCount: number;
  UserTable: React.ComponentType<any>;
  users: any[];
  isToday: (date: string) => boolean;
  isThisWeek: (date: string) => boolean;
  onUpdateUser: (id: string, data: any) => void;
  onDeleteUser: (id: string) => void;
  onAddUser: (data: any) => void;
}

export function DashboardUserComponent({
  userCount,
  weeklyUserCount,
  totalUserCount,
  UserTable,
  users,
  isToday,
  isThisWeek,
  onUpdateUser,
  onDeleteUser,
  onAddUser
}: DashboardUserComponentProps) {
 
 return <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-4">
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Users per Day</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl">{userCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              New users registered today
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={userCount} max={100} aria-label="Users per day" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Users per Week</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl">{weeklyUserCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              New users registered this week
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={weeklyUserCount} max={500} aria-label="Users per week" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl">{totalUserCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Total registered users
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={totalUserCount} max={10000} aria-label="Total users" />
          </CardFooter>
        </Card>

      </div>
      <Tabs defaultValue="total">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="total">Total</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="day">
      <UserTable 
        users={users.filter((user: { createdAt: { toString: () => any } }) => isToday(user.createdAt.toString()))} 
        onUpdate={onUpdateUser}
        onDelete={onDeleteUser}
        onAdd={onAddUser}
      />
    </TabsContent>
    <TabsContent value="week">
      <UserTable 
        users={users.filter((user: { createdAt: { toString: () => any } }) => isThisWeek(user.createdAt.toString()))} 
        onUpdate={onUpdateUser}
        onDelete={onDeleteUser}
      />
    </TabsContent>
    <TabsContent value="total">
      <UserTable 
        users={users} 
        onUpdate={onUpdateUser}
        onDelete={onDeleteUser}
      />
    </TabsContent>
      </Tabs>
    </div>

    <div>
      <Card className="bg-[#212121] overflow-hidden">
        <CardHeader className="bg-[#212121] flex flex-row items-start">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg">
              User Profile
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy User ID</span>
              </Button>
            </CardTitle>
            <CardDescription>Registered: {new Date(users[0]?.createdAt).toLocaleDateString()}</CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button size="sm" variant="outline" className="bg-[#5726D1] h-8 gap-1">
              <User className="h-3.5 w-3.5" />
              <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                Edit Profile
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="bg-[#5726D1] h-8 w-8">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Activity</DropdownMenuItem>
                <DropdownMenuItem>Export Data</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Delete Account</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <div className="grid gap-3">
            <div className="font-semibold">User Details</div>
            <dl className="grid gap-3">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Name</dt>
                <dd>{users[users.length - 1]?.firstName} {users[users.length - 1]?.lastName}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{users[users.length - 1]?.email}</dd>
              </div>
            </dl>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-3">
            <div className="font-semibold">Account Information</div>
            <dl className="grid gap-3">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">User ID</dt>
                <dd>{users[users.length - 1]?.id}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Created At</dt>
                <dd>{new Date(users[users.length - 1]?.createdAt).toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Last Updated</dt>
                <dd>{new Date(users[users.length - 1]?.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-[#212121] px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Last activity: <time dateTime={users[users.length - 1]?.updatedAt}>{new Date(users[users.length - 1]?.updatedAt).toLocaleString()}</time>
          </div>
          <Pagination className="ml-auto mr-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button size="icon" variant="outline" className="bg-[#5726D1] h-6 w-6">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="sr-only">Previous User</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="bg-[#5726D1] h-6 w-6">
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="sr-only">Next User</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>

  </main>
}