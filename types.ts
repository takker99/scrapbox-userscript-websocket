export type JoinRoomData = {
  pageId: string | null;
  projectId: string;
  projectUpdatesStream: false;
} | {
  pageId: null;
  projectId: string;
  projectUpdatesStream: true;
};

export interface JoinRoomResponse {
  data: {
    success: true;
    pageId: string | null;
    projectId: string;
  };
}

export interface ProjectUpdatesStreamCommit {
  kind: "page";
  id: string;
  parentId: string;
  projectId: string;
  pageId: string;
  userId: string;
  changes: Change[] | [Delete];
  cursor: null;
  freeze: true;
}
export type ProjectUpdatesStreamEvent =
  & {
    id: string;
    pageId: string;
    userId: string;
    projectId: string;
    created: number;
    updated: number;
  }
  & ({
    type: "member.join" | "invitation.reset";
  } | {
    type: "page.delete";
    data: {
      titleLc: string;
    };
  } | {
    type: "admin.add" | "admin.delete" | "owner.set";
    targetUserId: string;
  });

export interface CommitNotification {
  kind: "page";
  id: string;
  parentId: string;
  projectId: string;
  pageId: string;
  userId: string;
  changes: Change[] | [Pin] | [Delete];
  cursor: null;
  freeze: true;
}
export type CommitData = Omit<CommitNotification, "id">;
export interface CommitResponse {
  data: {
    commitId: string;
  };
}
export interface EventMap {
  "socket.io-request": (
    data: { method: "commit"; data: CommitData } | {
      method: "room:join";
      data: JoinRoomData;
    },
    callback: (
      response: (CommitResponse | JoinRoomResponse) & { error?: unknown },
    ) => void,
  ) => void;
  cursor: (
    data: Omit<MoveCursorData, "socketId">,
    callback: (response: { error?: unknown }) => void,
  ) => void;
}
export interface ListenEventMap {
  "projectUpdatesStream:commit": (
    data: ProjectUpdatesStreamCommit,
  ) => void;
  "projectUpdatesStream:event": (
    data: ProjectUpdatesStreamEvent,
  ) => void;
  commit: (data: CommitNotification) => void;
  cursor: (data: MoveCursorData) => void;
}
export type DataOf<Event extends keyof EventMap> = Parameters<
  EventMap[Event]
>[0];
export type ResponseOf<Event extends keyof EventMap> = Parameters<
  Parameters<
    EventMap[Event]
  >[1]
>[0];

export interface MoveCursorData {
  user: {
    id: string;
    displayName: string;
  };
  pageId: string;
  position: {
    line: number;
    char: number;
  };
  visible: boolean;
  socketId: string;
}

export type Change =
  | InsertCommit
  | UpdateCommit
  | DeleteCommit
  | LinksCommit
  | ProjectLinksCommit
  | DescriptionsCommit
  | ImageCommit
  | TitleCommit;
export interface InsertCommit {
  _insert: string;
  lines: {
    id: string;
    text: string;
  };
}
export interface UpdateCommit {
  _update: string;
  lines: {
    text: string;
  };
}
export interface DeleteCommit {
  _delete: string;
  lines: -1;
}
export interface LinksCommit {
  links: string[];
}
export interface ProjectLinksCommit {
  projectLinks: string[];
}
export interface DescriptionsCommit {
  descriptions: string[];
}
export interface ImageCommit {
  image: string | null;
}
export interface TitleCommit {
  title: string;
}
export interface Pin {
  pin: number;
}
export interface Delete {
  deleted: true;
}
