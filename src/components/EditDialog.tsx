import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clipping } from "@/types";

interface EditDialogProps {
  clipping: Clipping | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedClipping: Clipping) => void;
}

const EditDialog: React.FC<EditDialogProps> = ({
  clipping,
  open,
  onOpenChange,
  onSave,
}) => {
  const [content, setContent] = React.useState("");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (clipping) {
      setContent(clipping.content);
      setNote(clipping.note || "");
    }
  }, [clipping]);

  const handleSave = () => {
    if (!clipping) return;

    const updatedClipping: Clipping = {
      ...clipping,
      content,
      note: note.trim() || undefined,
    };

    onSave(updatedClipping);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑标注</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">笔记</Label>
            <Textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="min-h-32"
              placeholder="添加笔记..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
