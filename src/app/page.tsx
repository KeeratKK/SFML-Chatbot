"use client";
import MainChat from "@/components/MainChat";
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/messages";
import { Send } from "react-feather";
import AssistantMessage from "@/components/AssistantMessage";

export default function Home() {
  
  return (

    <main className="h-screen bg-black p-6 flex flex-col overflow-clip">
      <MainChat></MainChat>
    </main>

  );

}