export type ActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: Record<string, unknown>;
};

export const initialActionState: ActionState = {};
