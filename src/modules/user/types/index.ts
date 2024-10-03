export type OptionalWithoutNull<T> = {
  [K in keyof T]?: Exclude<T[K], null>;
};
