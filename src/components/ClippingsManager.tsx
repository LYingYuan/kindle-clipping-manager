"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { Clipping } from "@/types";
import { FileDown } from "lucide-react";
import ClippingCard from "@/components/ClippingCard";
import EditDialog from "./EditDialog";

interface ParsedDateTime {
  timestamp: number;
  weekDay: number;
}

const ClippingsManager: React.FC = () => {
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [editingClipping, setEditingClipping] = useState<Clipping | null>(null);
  const [filter, setFilter] = useState("");

  const parseChineseDateTime = (datetime: string): ParsedDateTime => {
    // 示例格式: "2025年1月15日星期三 下午12:41:20"
    const yearMatch = datetime.match(/(\d{4})年/);
    const monthMatch = datetime.match(/(\d{1,2})月/);
    const dayMatch = datetime.match(/(\d{1,2})日/);
    const weekDayMatch = datetime.match(/星期(.)\s/);
    const timeMatch = datetime.match(
      /(上午|下午)(\d{1,2}):(\d{1,2}):(\d{1,2})/
    );

    if (!yearMatch || !monthMatch || !dayMatch || !weekDayMatch || !timeMatch) {
      return {
        timestamp: 0,
        weekDay: -1,
      };
    }

    const year = parseInt(yearMatch[1]);
    const month = parseInt(monthMatch[1]);
    const day = parseInt(dayMatch[1]);
    const weekDay = weekDayMatch[1];
    let hour = parseInt(timeMatch[2]);
    const minute = parseInt(timeMatch[3]);
    const second = parseInt(timeMatch[4]);

    if (timeMatch[1] === "下午") {
      if (hour < 12) {
        hour += 12;
      }
    } else if (timeMatch[1] === "上午" && hour === 12) {
      hour = 0;
    }

    const date = new Date(year, month - 1, day, hour, minute, second);
    const weekDayIndex = ["日", "一", "二", "三", "四", "五", "六"].indexOf(
      weekDay
    );

    return {
      timestamp: date.getTime(),
      weekDay: weekDayIndex,
    };
  };

  const parseClippings = (text: string): Clipping[] => {
    //  馬斯克傳 (Walter Isaacson 著 (吴凯琳 译))
    // - 您在第 138 页（位置 #2301-2301）的标注 | 添加于 2025年1月15日星期三 下午12:41:20

    // 即使是在燃煤發電的地方，電動車仍然對環境最友善。
    // ==========
    // 分割文本为独立的标注条目
    const entries = text.split("==========").filter(entry => entry.trim());

    return entries
      .map(entry => {
        const lines = entry
          .trim()
          .replace(/\r\n/g, "\n")
          .split("\n")
          .filter(line => line.trim());
        if (lines.length < 3) return null; // 跳过格式不正确的条目

        // 解析第一行 - 书名和作者
        const titleAuthorPattern = /^(.+?) \(((?:[^()]*|\([^()]*\))*)\)/;
        const titleAuthorMatch = lines[0].match(titleAuthorPattern);
        const book = titleAuthorMatch?.[1]?.trim() || "";
        const authors = titleAuthorMatch?.[2]?.trim() || "";

        // 解析第二行 - 时间戳
        const metadataLine = lines[1];
        const timestampMatch = metadataLine.match(/添加于\s(.+?)$/);
        const { timestamp, weekDay } = parseChineseDateTime(
          timestampMatch?.[1] || ""
        );

        // 解析第二行 - 页码和位置
        const pageMatch = metadataLine.match(/第 (\d+) 页/);
        const positionMatch = metadataLine.match(/位置 #(\d+-\d+)/);
        const page = parseInt(pageMatch?.[1] || "0");
        const position = positionMatch?.[1] || "0";

        if (timestamp === 0) {
          console.log("Error parsing timestamp: ", entry);
        }

        // 解析内容和笔记
        const contentStartIndex = 2;
        let content = "";
        let note: string | undefined;

        const hasNote = lines[1].includes("的笔记");
        if (hasNote) {
          const noteIndex = lines.length - 1;
          content = lines.slice(contentStartIndex, noteIndex).join("\n").trim();
          note = lines.slice(noteIndex).join("\n").trim();
        } else {
          content = lines.slice(contentStartIndex).join("\n").trim();
        }

        return {
          timestamp,
          book,
          authors,
          content,
          weekDay,
          page,
          position,
          ...(note && { note }),
        };
      })
      .filter((clipping): clipping is Clipping => clipping !== null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      const parsedClippings = parseClippings(text);
      setClippings(parsedClippings);
    }
  };

  const filterClippings = (clippings: Clipping[], filter: string) => {
    return clippings.filter(clipping => {
      return (
        clipping.book.toLowerCase().includes(filter.toLowerCase()) ||
        clipping.authors.toLowerCase().includes(filter.toLowerCase()) ||
        clipping.content.toLowerCase().includes(filter.toLowerCase()) ||
        (clipping.note &&
          clipping.note.toLowerCase().includes(filter.toLowerCase()))
      );
    });
  };

  const handleDelete = (timestamp: number) => {
    setClippings(
      clippings.filter(clipping => clipping.timestamp !== timestamp)
    );
  };

  const handleEdit = (clipping: Clipping) => {
    setEditingClipping(clipping);
  };

  const handleSaveEdit = (updatedClipping: Clipping) => {
    setClippings(
      clippings.map(clipping =>
        clipping.timestamp === updatedClipping.timestamp
          ? updatedClipping
          : clipping
      )
    );
  };

  const handleExport = () => {
    const formatClipping = (clipping: Clipping): string => {
      const date = new Date(clipping.timestamp);
      const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

      // 格式化日期时间
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDay = weekDays[clipping.weekDay];
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const isPM = hours >= 12;
      const hour12 = hours % 12 || 12;

      const formattedDateTime = `${year}年${month}月${day}日星期${weekDay} ${
        isPM ? "下午" : "上午"
      }${hour12}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      // 构建输出字符串
      const noteType = clipping.note ? "的笔记" : "的标注";
      return `${clipping.book} (${clipping.authors})
- 您在${
        clipping.page
          ? `第 ${clipping.page} 页（位置 #${clipping.position}）`
          : `位置 #${clipping.position}`
      }${noteType} | 添加于 ${formattedDateTime}

${clipping.content}${clipping.note ? `\n${clipping.note}` : ""}\n==========`;
    };

    const output = filteredClippings.map(formatClipping).join("\n");

    // 创建并下载文件
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "My Clippings.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredClippings = filterClippings(clippings, filter);

  return (
    <div>
      <Input type="file" accept=".txt" onChange={handleFileUpload}></Input>
      <Input
        type="text"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      ></Input>
      <Button onClick={handleExport}>
        <FileDown></FileDown>
        导出
      </Button>
      <section>
        {filteredClippings.map(clipping => (
          <ClippingCard
            key={clipping.timestamp}
            clipping={clipping}
            onEdit={handleEdit}
            onDelete={handleDelete}
          ></ClippingCard>
        ))}
      </section>

      <EditDialog
        clipping={editingClipping}
        open={!!editingClipping}
        onOpenChange={open => {
          if (!open) {
            setEditingClipping(null);
          }
        }}
        onSave={handleSaveEdit}
      ></EditDialog>
    </div>
  );
};

export default ClippingsManager;
