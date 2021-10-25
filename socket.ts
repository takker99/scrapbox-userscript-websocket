/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
import type {
  Manager,
  ManagerOptions,
  Socket,
  SocketOptions,
} from "./types/socketIO/index.ts";
export type { Manager, ManagerOptions, Socket, SocketOptions };

declare global {
  interface Window {
    io(
      uri: string,
      opts?: Partial<ManagerOptions & SocketOptions>,
    ): Socket;
  }
}
const version = "4.2.0";

export async function socketIO() {
  const io = await importSocketIO();
  return io("https://scrapbox.io", {
    reconnectionDelay: 5000,
    transports: ["websocket"],
  });
}

function importSocketIO(): Promise<Window["io"]> {
  const url =
    `https://cdnjs.cloudflare.com/ajax/libs/socket.io/${version}/socket.io.min.js`;
  if (document.querySelector(`script[src="${url}"]`)) {
    return Promise.resolve(window.io);
  }

  const script = document.createElement("script");
  script.src = url;
  return new Promise((resolve, reject) => {
    script.onload = () => resolve(window.io);
    script.onerror = (e) => reject(e);
    document.head.append(script);
  });
}
