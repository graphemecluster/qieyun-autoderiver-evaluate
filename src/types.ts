import type { CustomNode } from "./CustomElement";
import type { 音韻地位 } from "qieyun";
import type { DOMNode } from "./create";

export type Option =
  | "convertArticle"
  | "convertPresetArticle"
  | "exportAllSmallRhymes"
  | "compareSchemas"
  | "exportAllSyllables"
  | "exportAllSyllablesWithCount";

declare class ParameterSet {}

export type MainState = Readonly<{
  schemas: SchemaState[];
  article: string;
  option: Option;
  convertVariant: boolean;
  syncCharPosition: boolean;
  activeSchemaName: string;
}>;

export type SchemaState = Readonly<{
  name: string;
  input: string;
  parameters: ParameterSet;
}>;

export type Entry = Readonly<{
  結果: Query[];
  擬音: CustomNode[];
}>;

export type DOMEntry = Readonly<{
  結果: Query[];
  擬音: DOMNode[];
}>;

export type Query = Readonly<{
  字頭: string;
  解釋: string;
  音韻地位: 音韻地位;
}>;
