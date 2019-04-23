export default class CodedError extends Error {
  constructor(public code: number) {
    super(`code: ${code}`);
  }
}

export enum CODE {
  QUEST_VISITED,
  QUEST_DISABLED,
  QUEST_NOT_FOUND,
  QUEST_IN_PROGRESS,

  QUEST_HAS_NO_QUESTIONS,

  OPTION_NOT_VALID,

  EMAIL_MISSING,
  TEXT_MISSING,
  CONTACT_MISSING,

  NOTHING_IN_PROGRESS,
};
