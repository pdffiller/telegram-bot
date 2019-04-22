import ReplyMessage from "./ReplyMessage";

export default class ReplyCollection {
  constructor(
    public isFinal: boolean,
    public replyMessages: ReplyMessage[],
  ) {}
}