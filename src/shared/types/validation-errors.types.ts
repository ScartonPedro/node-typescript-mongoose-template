export type ValidationErrors = {
  [field: string]: {
    type: string;
    expected?: any;
    value?: any;
  };
};
