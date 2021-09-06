export interface ChatOpInfo {
  commands: ChatOpCommand[];
  params: ChatOpParam[];
}

export type ChatOpCommand = '/create-branch-ado' | '/cb-ado' | 'None';
export type ChatOpParam = '-username' | '-branch' | 'None';

export type ParamValueMap = { [_ in ChatOpParam]?: string };

const createBranchChatOpInfo: ChatOpInfo = {
  commands: ['/cb-ado', '/create-branch-ado'],
  params: ['-branch', '-username']
};

const chatOpInfo: ChatOpInfo[] = [createBranchChatOpInfo];
export { chatOpInfo };

const chatOps: ChatOpCommand[] = createBranchChatOpInfo.commands;
export { chatOps };
