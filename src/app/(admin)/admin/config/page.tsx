import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Leaf, DollarSign, Save, Info } from "lucide-react";

export const runtime = "nodejs";

const ConfigPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">System Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Define the mathematics behind impact tracking and grant reporting.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <CardTitle>Environmental Coefficients</CardTitle>
            </div>
            <CardDescription>lbs of CO2 diverted per lb of material.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="copper">Copper</Label>
              <Input id="copper" type="number" defaultValue="2.5" />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="lead">Lead</Label>
              <Input id="lead" type="number" defaultValue="1.8" />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="plastic">Plastic</Label>
              <Input id="plastic" type="number" defaultValue="0.7" />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="circuit">Circuit Boards</Label>
              <Input id="circuit" type="number" defaultValue="3.2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <CardTitle>Economic Value</CardTitle>
            </div>
            <CardDescription>Wage data for calculating economic contribution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="living-wage">Local Living Wage ($/hr)</Label>
              <Input id="living-wage" type="number" defaultValue="15.50" />
              <p className="text-[10px] text-muted-foreground">Used for: Total Work Hours × Wage = Economic Impact</p>
            </div>
            
            <Separator />

            <div className="rounded-lg bg-blue-50 p-4 text-blue-800 border border-blue-100">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold">Formula Check</p>
                  <p className="mt-1">Changes to these values will retroactively update all dashboard impact stats. Ensure you have board approval before modifying grant coefficients.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>
          <Save className="mr-2 h-4 w-4" /> Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default ConfigPage;
