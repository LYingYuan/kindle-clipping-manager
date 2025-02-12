"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { Clipping } from "@/types";

export interface ClippingCardProps {
  clipping: Clipping;
  onEdit: (clipping: Clipping) => void;
  onDelete: (timestamp: number) => void;
}

const ClippingCard: React.FC<ClippingCardProps> = ({
  clipping,
  onEdit,
  onDelete,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{clipping.book}</CardTitle>
        <address>{clipping.authors}</address>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onEdit(clipping)}
            aria-label="Edit"
            variant="outline"
          >
            <Pencil />
          </Button>
          <Button
            onClick={() => onDelete(clipping.timestamp)}
            aria-label="Delete"
            variant="destructive"
          >
            <Trash2 />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p>{clipping.content}</p>
        {clipping.note && <p className="mt-4">{clipping.note}</p>}
      </CardContent>
    </Card>
  );
};

export default ClippingCard;
