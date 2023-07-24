<script setup lang="ts">
import { logger } from "@kirklin/logger";
import type { ChatMessage } from "../types/chat";
import { createChatStream, readChatStream } from "~/utils/chat";

logger.info("I'm ready!  ⸜(๑'ᵕ'๑)⸝⋆*");
const messageList = ref<ChatMessage[]>([
  {
    role: "system",
    content: "你是 ChatGPT，OpenAI 训练的大型语言模型，尽可能简洁地回答。",
  },
]);

const sendChatMessage = async (content: string) => {
  try {
    messageList.value.push({ role: "user", content });
    messageList.value.push({ role: "assistant", content: "" });

    const { body, status } = await createChatStream(messageList.value, "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");
    if (body) {
      const reader = body.getReader();
      await readChatStream(reader, status, (content) => {
        logger.info(`chatGPT的回答：${content}`);
      });
    }
  } catch (error: any) {
    logger.error(error);
  }
};
sendChatMessage("你好");
</script>

<template>
  <RouterView />
</template>
