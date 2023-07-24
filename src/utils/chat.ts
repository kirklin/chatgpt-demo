import type { AnyFn } from "@vueuse/core";
import type { ChatMessage, OpenAIModel } from "../../types/chat";

/**
 * Creates a chat stream.
 * 创建聊天流
 * @param messageList - The message list.
 * @param apiKey - The API key.
 * @param model - The model.
 */
export async function createChatStream(messageList: ChatMessage[], apiKey: string, model: OpenAIModel = "gpt-3.5-turbo") {
  return await fetch("https://api.openai.com/v1/chat/completions", {
    method: "post",
    // signal: AbortSignal.timeout(8000),
    // 开启后到达设定时间会中断流式输出
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: messageList,
    }),
  });
}

/**
 * Reads a chat stream.
 * 读取聊天流
 * @param {ReadableStreamDefaultReader<Uint8Array>} reader - The reader for the stream.
 * @param {number} status - The status code.
 * @param {AnyFn} contentHandler - The content handler function.
 */
export const readChatStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  status: number,
  contentHandler: AnyFn,
) => {
  const decoder = new TextDecoder("utf-8");
  let partialLine = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    const decodedText = decoder.decode(value, { stream: true });

    if (status !== 200) {
      const json = JSON.parse(decodedText); // start with "data: "
      const content = json.error.message ?? decodedText;
      contentHandler(content);
      return;
    }

    const chunk = partialLine + decodedText;
    const newLines = chunk.split(/\r?\n/);

    partialLine = newLines.pop() ?? "";

    for (const line of newLines) {
      if (line.length === 0) {
        continue;
      } // ignore empty message
      if (line.startsWith(":")) {
        continue;
      } // ignore sse comment message
      if (line === "data: [DONE]") {
        return;
      }

      const json = JSON.parse(line.substring(6)); // start with "data: "
      const content
          = status === 200
            ? json.choices[0].delta.content ?? ""
            : json.error.message;
      contentHandler(content);
    }
  }
};
