import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SystemCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SystemCard({ title, description, children }: SystemCardProps) {
  return (
    <Card className="border-border/80 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
