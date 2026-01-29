import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickStatProps {
  label: string;
  value: string | number;
  sublabel: string;
  link: string;
  alert?: boolean;
}

export function QuickStat({ label, value, sublabel, link, alert }: QuickStatProps) {
  return (
    <Link href={link}>
      <Card className={`h-full border-none shadow-sm hover:shadow-md transition-all ${alert ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-900'}`}>
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {label}
            </p>
            <h3 className={`text-3xl font-black ${alert ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {value}
            </h3>
            <p className={`text-sm mt-1 ${alert ? 'text-red-600/80 dark:text-red-400/80' : 'text-slate-500 dark:text-slate-400'}`}>
              {sublabel}
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
            View <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
