import { createElement, Ruby } from "./create";
import { addTooltip } from "./tooltip";

import type { DOMEntry } from "./types";

type TooltipListener = (id: number, ch: string, 描述: string) => void;
let tooltipListener: TooltipListener = () => {};
export function listenTooltip(listener: TooltipListener) {
  tooltipListener = listener;
}

export function Char({ id, ch, entries, index }: { id: number; ch: string; entries: DOMEntry[]; index: number }) {
  const tooltip = <div style={{ paddingBottom: "3px" }} />;
  const wrapper = <span style={{ display: "inline-block", padding: "0 3px" }} />;

  (function reset() {
    const resolved = index !== -1;
    const currIndex = +resolved && index;
    const { 擬音, 結果 } = entries[currIndex];
    const multiple = entries.length > 1;

    function onClick(charIndex: number, 描述: string) {
      return multiple
        ? () => {
            index = charIndex;
            reset();
            tooltipListener(id, ch, 描述);
          }
        : undefined;
    }

    tooltip.textContent = "";
    tooltip.append(
      ...entries.map(({ 擬音, 結果 }, index) => (
        // @ts-expect-error
        <p
          style={{
            margin: "2px 10px",
            whiteSpace: "pre-line",
            color: 結果.some(({ 解釋 }) => !解釋) ? "#c00" : multiple && index === currIndex ? "#00f" : "black",
          }}
          onClick={onClick(index, 結果[0].音韻地位.描述)}>
          <span lang="och-Latn-fonipa" style={{ whiteSpace: "nowrap" }}>
            {擬音.flatMap((item, index) => (index ? [<span> / </span>, item] : [item]))}
          </span>
          {結果.flatMap((res, i) => {
            const { 字頭, 解釋, 音韻地位 } = res;
            const { 描述 } = 音韻地位;
            let 反切 = 音韻地位.反切(字頭);
            反切 = 反切 === null ? "" : `${反切}切 `;
            return [
              i ? <br /> : " ",
              // @ts-expect-error
              <span onClick={onClick(index, 描述)}>
                <span style={{ fontSize: "125%" }}>{字頭}</span> {描述} {反切 + 解釋}
              </span>,
            ];
          })}
        </p>
      ))
    );
    wrapper.textContent = "";
    wrapper.style.color = 結果.some(({ 解釋 }) => !解釋) ? "#c00" : multiple ? (resolved ? "#708" : "#00f") : "black";
    wrapper.appendChild(<Ruby rb={ch} rt={擬音} />);
  })();

  addTooltip(tooltip, wrapper);
  return wrapper;
}
