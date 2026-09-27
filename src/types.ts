export type Pair = {
  id: string;
  workspaceId: string;
  title: string;
  heading: string;
  body: string;
  category: string;
  favorite: boolean;
  headingFont: string;
  bodyFont: string;
  size: number;
  weight: number;
  leading: number;
  tracking: number;
};

export type Workspace = {
  id: string;
  name: string;
  createdAt: number;
};

export type AppState = {
  workspaces: Workspace[];
  pairs: Pair[];
  activeWorkspaceId: string | null;
  /** 每个工作区各自记住最后打开的配对，切换回去时复原画布 */
  selectedByWorkspace: Record<string, string>;
};

/** 清空工作区时对其中配对的处置方式：移到别的工作区，或一并删除 */
export type ClearStrategy = { type: 'move'; targetId: string } | { type: 'purge' };
