/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />

import type { Socket } from "./socket.ts";
import type { DataOf, EventMap, ListenEventMap, ResponseOf } from "./types.ts";
export * from "./types.ts";
export * from "./socket.ts";

export function wrap(
  socket: Socket,
  timeout = 90000,
) {
  function request<EventName extends keyof EventMap>(
    event: EventName,
    data: DataOf<EventName>,
  ): Promise<
    EventName extends "cursor" ? void
      : ResponseOf<"socket.io-request">["data"]
  > {
    let id: number | undefined;
    type ResolveType = EventName extends "cursor" ? void
      : ResponseOf<"socket.io-request">["data"];
    return new Promise((resolve, reject) => {
      const onDisconnect = (message: string) => {
        clearTimeout(id);
        reject(new Error(message));
      };
      socket.emit(event, data, (response: ResponseOf<EventName>) => {
        clearTimeout(id);
        socket.off("disconnect", onDisconnect);
        if (response.error) {
          reject(
            new Error(JSON.stringify(response.error)),
          );
        }
        if ("data" in response) {
          resolve(response?.data as ResolveType);
        } else {
          resolve(undefined as ResolveType);
        }
      });
      id = setTimeout(() => {
        socket.off("disconnect", onDisconnect);
        reject(new Error(`Timeout: exceeded ${timeout}ms`));
      }, timeout);
      socket.once("disconnect", onDisconnect);
    });
  }

  async function* response<EventName extends keyof ListenEventMap>(
    event: EventName,
  ) {
    type Data = Parameters<ListenEventMap[EventName]>[0];
    let _resolve: ((data: Data) => void) | undefined;
    const waitForEvent = () => new Promise<Data>((res) => _resolve = res);
    const resolve = (data: Data) => {
      _resolve?.(data);
    };

    socket.on(
      event,
      // @ts-ignore 何故か型推論に失敗する
      resolve,
    );
    try {
      yield await waitForEvent();
    } finally {
      socket.off(event, resolve);
    }
  }

  return { request, response };
}
