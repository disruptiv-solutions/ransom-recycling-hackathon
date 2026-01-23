"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const MentorCard = ({ name, mentorName }: { name: string, mentorName: string }) => {
  return (
    <Card className="border-none bg-white shadow-sm">
      <CardContent className="flex flex-col items-center p-8 text-center">
        <Avatar className="h-16 w-16 mb-4">
          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" />
          <AvatarFallback>SR</AvatarFallback>
        </Avatar>
        <h4 className="font-bold text-[#1F292E]">Need help, {name}?</h4>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {mentorName} is available for a quick chat until 4 PM.
        </p>
        <Button variant="outline" className="mt-4 w-full border-[#30D59B] text-[#30D59B] hover:bg-[#E8FBF4] font-bold rounded-xl py-5">
          Send Message
        </Button>
      </CardContent>
    </Card>
  );
};
