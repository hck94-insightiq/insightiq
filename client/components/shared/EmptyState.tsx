import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface Props {
    title: string
    description: string
    ctaLabel?: string
    ctaHref?: string
    icon?: React.ReactNode
}

export function EmptyState({ title, description, ctaLabel, ctaHref, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed rounded-lg">
      <div className="mb-4 text-muted-foreground">
        {icon ?? <Sparkles size={48} />}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {ctaLabel && ctaHref && (
        <Button asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  );
}