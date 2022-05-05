import { iter音韻地位, query字頭, 音韻地位 } from "qieyun";
import Yitizi from "yitizi";

import { Char } from "./Char";
import CustomElement from "./CustomElement";
import { createElement, DOMNode, Ruby, Table } from "./create";

import type { CustomNode } from "./CustomElement";
import type { Entry, MainState, Option, SchemaState } from "./types";

const 所有地位 = Array.from(iter音韻地位());
type Deriver = (音韻地位: 音韻地位, 字頭?: string | null) => CustomNode[];
type Handler = (state: MainState, callDeriver: Deriver) => DOMNode | DOMNode[];

function title(schemas: SchemaState[]) {
  return schemas.map(({ name }) => name);
}

function serialize(callDeriver: Deriver): [string, CustomNode[]][] {
  return 所有地位.map(音韻地位 => callDeriver(音韻地位)).map(擬音陣列 => [JSON.stringify(擬音陣列), 擬音陣列]);
}

function iterate(callDeriver: Deriver) {
  return 所有地位.map(音韻地位 => ({ 描述: 音韻地位.描述, 擬音陣列: callDeriver(音韻地位), 代表字: 音韻地位.代表字 }));
}

function finalize(result: ReturnType<typeof iterate>) {
  return result.map(({ 描述, 擬音陣列, 代表字 }) => [描述, ...wrap(擬音陣列), 代表字 || ""]);
}

function wrap(擬音陣列: CustomNode[]) {
  return CustomElement.render(擬音陣列).map(擬音 => <span lang="och-Latn-fonipa">{擬音}</span>);
}

let presetArticle = "";

export function getArticle() {
  return presetArticle;
}

export function setArticle(article: string) {
  presetArticle = article;
}

type ArticleListener = (syncedArticle: string[]) => void;
let articleListener: ArticleListener = () => {};
export function listenArticle(listener: ArticleListener) {
  articleListener = listener;
}

export const evaluateOption: Record<Option, Handler> = {
  convertArticle({ article, convertVariant }, callDeriver) {
    const syncedArticle: string[] = [];
    const result: DOMNode[] = [];
    const chs = Array.from(article);

    for (let i = 0; i < chs.length; i++) {
      let pushed = false;
      const ch = chs[i];
      const 所有異體字 = [ch, null].concat(Yitizi.get(ch));
      const entries: Entry[] = [];
      let selectedIndex = -1;

      for (const 字頭 of 所有異體字) {
        if (!字頭) {
          if (convertVariant) continue;
          if (!entries.length) continue;
          break;
        }
        for (const { 解釋, 音韻地位 } of query字頭(字頭)) {
          const 擬音 = callDeriver(音韻地位, 字頭);
          let entry = entries.find(key => CustomElement.isEqual(key.擬音, 擬音));
          if (!entry) entries.push((entry = { 擬音, 結果: [] }));
          entry.結果.push({ 字頭, 解釋, 音韻地位 });
        }
      }

      if (chs[i + 1] === "(") {
        let j = i;
        while (chs[++j] !== ")" && j < chs.length);

        if (j < chs.length) {
          const 描述 = chs.slice(i + 2, j).join("");
          const 地位 = (() => {
            try {
              return 音韻地位.from描述(描述);
            } catch {
              return undefined;
            }
          })();
          if (地位) {
            selectedIndex = entries.findIndex(({ 結果 }) => 結果.some(({ 音韻地位 }) => 音韻地位.等於(地位)));
            if (selectedIndex === -1) {
              const 擬音 = callDeriver(地位, ch);
              selectedIndex = entries.findIndex(key => CustomElement.isEqual(key.擬音, 擬音));
              if (selectedIndex === -1) selectedIndex = entries.push({ 擬音, 結果: [] }) - 1;
              entries[selectedIndex].結果.push({ 字頭: ch, 解釋: "", 音韻地位: 地位 });
            }
            syncedArticle.push(chs.slice(i, j + 1).join(""));
            i = j;
            pushed = true;
          }
        }
      }
      if (!pushed) syncedArticle.push(chs[i]);
      const index = syncedArticle.length - 1;

      result.push(
        entries.length
          ? Char({
              id: index,
              ch,
              entries: entries.map(({ 結果, 擬音 }) => ({ 結果, 擬音: CustomElement.render(擬音) })),
              index: selectedIndex,
            })
          : ch
      );
    }
    articleListener(syncedArticle);
    return result;
  },

  convertPresetArticle(_, callDeriver) {
    return presetArticle.split("\n\n").flatMap(passage => [
      ...passage.split("\n").flatMap((line, index) => {
        const output: DOMNode[] = [];
        const chs = Array.from(line);

        for (let i = 0; i < chs.length; i++) {
          if (chs[i + 1] === "(") {
            const j = i;
            while (chs[++i] !== ")" && i < chs.length);

            const 字頭 = chs[j];
            const 描述 = chs.slice(j + 2, i).join("");
            const 地位 = 音韻地位.from描述(描述);
            const 擬音 = callDeriver(地位, 字頭);

            output.push(<Ruby rb={字頭} rt={CustomElement.render(擬音)} />);
          } else output.push(chs[i]);
        }

        const Tag = index ? "p" : "h3";
        return [<Tag>{output}</Tag>, <span hidden>{"\n"}</span>];
      }),
      <span hidden>{"\n"}</span>,
    ]);
  },

  exportAllSmallRhymes({ schemas }, callDeriver) {
    return <Table head={["音韻地位", ...title(schemas), "代表字"]} body={finalize(iterate(callDeriver))} />;
  },

  exportAllSyllables({ schemas }, callDeriver) {
    return <Table head={title(schemas)} body={Array.from(new Map(serialize(callDeriver)).values()).map(wrap)} />;
  },

  exportAllSyllablesWithCount({ schemas }, callDeriver) {
    type Data = [serialized: string, 擬音陣列: CustomNode[], count: number];
    const result: Data[] = [];
    serialize(callDeriver)
      .sort(([a], [b]) => +(a > b) || -(a < b))
      .reduce<Data | null>((previous, [serialized, 擬音陣列]) => {
        if (previous && previous[0] === serialized) {
          previous[2]++;
          return previous;
        }
        const temp: Data = [serialized, 擬音陣列, 1];
        result.push(temp);
        return temp;
      }, null);
    return (
      <Table
        head={[...title(schemas), "計數"]}
        body={result.sort((a, b) => b[2] - a[2]).map(([, 擬音陣列, count]) => [...wrap(擬音陣列), count + ""])}
      />
    );
  },

  compareSchemas({ schemas }, callDeriver) {
    const result = iterate(callDeriver).filter(({ 擬音陣列 }) =>
      擬音陣列.some(擬音 => !CustomElement.isEqual(擬音, 擬音陣列[0]))
    );
    return result.length ? (
      [
        <h3 style={{ margin: "0 0 1rem 0.25rem" }}>
          找到 {result.length} 個相異項目。
          <span hidden>{"\n\n"}</span>
        </h3>,
        <Table head={["音韻地位", ...title(schemas), "代表字"]} body={finalize(result)} />,
      ]
    ) : (
      <h3>方案擬音結果相同。</h3>
    );
  },
};
