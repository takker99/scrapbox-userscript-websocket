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

type IO = (
  uri: string,
  opts?: Partial<ManagerOptions & SocketOptions>,
) => Socket;

declare global {
  interface Window {
    io?: IO;
  }
}
const version = "4.2.0";
const url =
  `https://cdnjs.cloudflare.com/ajax/libs/socket.io/${version}/socket.io.min.js`;
let error: string | Event | undefined;

export async function socketIO(): Promise<Socket> {
  const io = await importSocketIO();
  const socket = io("https://scrapbox.io", {
    reconnectionDelay: 5000,
    transports: ["websocket"],
  });

  await new Promise<void>((resolve, reject) => {
    const onDisconnect = (reason: Socket.DisconnectReason) => reject(reason);
    socket.once("connect", () => {
      socket.off("disconnect", onDisconnect);
      resolve();
    });
    socket.once("disconnect", onDisconnect);
  });
  return socket;
}

async function importSocketIO(): Promise<IO> {
  if (!document.querySelector(`script[src="${url}"]`)) {
    const script = document.createElement("script");
    script.src = url;
    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = (e) => {
        error = e;
        reject(e);
      };
      document.head.append(script);
    });
  }

  return new Promise((resolve, reject) => {
    const id = setInterval(() => {
      if (!window.io) return;
      clearInterval(id);
      resolve(window.io);
    }, 500);
  });
}
