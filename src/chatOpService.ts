import { ChatOpCommand, ChatOpParam, ParamValueMap, chatOpInfo, chatOps } from './chatOps';

export class ChatOpService {
  private constructor() {}

  static build(): ChatOpService {
    return new ChatOpService();
  }

  getChatOpCommand(comment: string): ChatOpCommand {
    const command = this.getCommandString(comment);
    return chatOps.find(op => op === command) || 'None';
  }

  getParameterValues(command: ChatOpCommand, comment: string): ParamValueMap {
    const possibleParams = chatOpInfo.find(info => info.commands.includes(command))?.params || [];
    if (possibleParams.length === 0) return {};
    const paramValueMap: ParamValueMap = {};
    for (const pp of possibleParams) {
      paramValueMap[pp] = this.getParamValue(pp, comment);
    }
    return paramValueMap;
  }

  private getCommandString(comment: string): string {
    const commentTrim = comment.trim();
    if (!commentTrim.startsWith('/')) return '';
    const command = commentTrim.split(' ')[0];
    return command;
  }

  private getParamValue(param: ChatOpParam, comment: string): string {
    const splitResult = comment.split(param);
    if (splitResult.length < 2) return '';
    const theRest = splitResult[1].trim();
    return theRest.split(' ')[0];
  }
}
